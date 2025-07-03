import cv2 , os
import shutil
import face_recognition
import numpy as np
import multiprocessing
import asyncio
from fastapi import FastAPI, WebSocket , Request,UploadFile, File
import requests
from multiprocessing import Queue
import json
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from fastapi.responses import JSONResponse






app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as per your requirements
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global flag for stopping the processes
stop_flag = multiprocessing.Event()

# Fetch student list from the API
# Fetch student list from the API
def fetch_student_list(class_id):
    api_url = f"http://localhost:5000/api/classes/{class_id}/students"
    response = requests.get(api_url)
    if response.status_code == 200:
        try:
            student_data = response.json()
            known_face_encodings = [np.array(student['encoding']) for student in student_data]
            known_face_names = [student['name'] for student in student_data]
            known_face_ids = [student['id'] for student in student_data]  # Get student IDs
            return known_face_encodings, known_face_names, known_face_ids
        except ValueError as e:
            print("Error decoding JSON:", e)
            return [], [], []
    else:
        print(f"Error fetching student data: {response.status_code}")
        return [], [], []


# Function to process video and put frames into a queue
def capture_video_frames(frame_queue, stop_flag):
    video_capture = cv2.VideoCapture(0)
    if not video_capture.isOpened():
        print("Error: Could not open webcam.")
        return

    while not stop_flag.is_set():
        ret, frame = video_capture.read()
        if not ret:
            print("Error: Could not capture image.")
            break

        # Process the frame for face detection and show it
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        # Draw boxes around faces
        for (top, right, bottom, left) in face_locations:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

        if frame_queue.qsize() < 10:  # Avoid overfilling the queue
            frame_queue.put(frame)

        cv2.imshow('Video Feed with Boxes', frame)

        # Check if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    print("Video capture stopped and windows closed.")  # Log for debugging
    video_capture.release()
    cv2.destroyAllWindows()

# Function to recognize faces from frames in the queue
def recognize_faces(frame_queue, known_face_encodings, known_face_names, known_face_ids, recognized_names_queue, stop_flag):
    recognized_set = set()  
    while not stop_flag.is_set():
        if not frame_queue.empty():
            frame = frame_queue.get()
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            recognized_students = []
            for encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, encoding, tolerance=0.6)
                name = "Unknown"
                student_id = None
                if True in matches:
                    first_match_index = matches.index(True)
                    name = known_face_names[first_match_index]
                    student_id = known_face_ids[first_match_index]

                if name != "Unknown" and (name, student_id) not in recognized_set:
                    recognized_students.append({"name": name, "id": student_id})
                    recognized_set.add((name, student_id))

            # Only add non-empty, unique names and IDs to the queue
            if recognized_students:
                recognized_names_queue.put(recognized_students)

    print("Recognition process stopped.")  # Log for debugging


# Function to manage both processes
async def handle_face_image_capture(known_face_encodings, known_face_names, known_face_ids, websocket: WebSocket):
    global stop_flag

    # Reset the stop flag to ensure we can start again
    stop_flag.clear()

    frame_queue = Queue(maxsize=10)
    recognized_names_queue = Queue()

    # Start video capture process
    video_process = multiprocessing.Process(target=capture_video_frames, args=(frame_queue, stop_flag))
    video_process.start()

    # Start face recognition process
    recognition_process = multiprocessing.Process(target=recognize_faces, args=(frame_queue, known_face_encodings, known_face_names, known_face_ids, recognized_names_queue, stop_flag))
    recognition_process.start()

    try:
        sent_students_set = set()  # Set to keep track of already sent names and IDs
        while True:
            if not recognized_names_queue.empty():
                recognized_students = recognized_names_queue.get()

                new_students = [student for student in recognized_students if (student['name'], student['id']) not in sent_students_set]
                if new_students:
                    sent_students_set.update((student['name'], student['id']) for student in new_students)
                    await websocket.send_text(f"Recognized Students: {json.dumps(new_students)}")

            await asyncio.sleep(0.01)
    except Exception as e:
        print(f"An error occurred: {e}")
        await websocket.send_text(f"Error occurred: {str(e)}")
    finally:
        stop_flag.set()  # Set the stop flag to end both processes
        print("Stop flag set, terminating video and recognition processes.")
        video_process.join()  # Ensure video capture process terminates
        recognition_process.join()  # Ensure recognition process terminates
        print("Processes terminated.")


# WebSocket endpoint to initiate face recognition
@app.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Wait for classId from the WebSocket
        data = await websocket.receive_text()
        class_id_data = json.loads(data)
        class_id = class_id_data.get("classId")

        if class_id:
            known_face_encodings, known_face_names, known_face_ids = fetch_student_list(class_id)
            if known_face_encodings and known_face_names and known_face_ids:
                await handle_face_image_capture(known_face_encodings, known_face_names, known_face_ids, websocket)
            else:
                await websocket.send_text("No students found for this class.")
        else:
            await websocket.send_text("Class ID is invalid.")
    except Exception as e:
        print(f"An error occurred: {e}")
        await websocket.send_text(f"Error occurred: {str(e)}")
    finally:
        print("WebSocket connection closed, stopping processes.")
        stop_flag.set()  # Set the stop flag to end both processes
        video_process.join()  # Ensure video capture process terminates
        recognition_process.join()  # Ensure recognition process terminates
        print("Stop flag set, terminating video and recognition processes.")

try:
    client = MongoClient("Mongodb-URI")
    db = client['test']
    collection = db['students']
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Function to detect and draw faces
def detect_and_draw_faces(frame):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    # Draw rectangles around detected faces
    for (top, right, bottom, left) in face_locations:
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

    return frame, face_encodings

# FastAPI route to get students
@app.get('/students')
async def get_students():
    students = list(collection.find())
    for student in students:
        student["_id"] = str(student["_id"])  # Convert ObjectId to string
    return JSONResponse(content=students)

# FastAPI route to capture face image
@app.post('/capture')
async def capture_face_image():
    # Initialize webcam
    video_capture = cv2.VideoCapture(0)

    if not video_capture.isOpened():
        return JSONResponse(content={"error": "Could not open webcam."}, status_code=500)

    print("Press 's' or space to capture a face image. Press 'q' to exit.")

    while True:
        ret, frame = video_capture.read()

        if not ret:
            video_capture.release()
            cv2.destroyAllWindows()
            return JSONResponse(content={"error": "Could not capture image."}, status_code=500)

        # Detect and draw faces in the frame
        frame_with_faces, face_encodings = detect_and_draw_faces(frame)

        # Display the video feed
        cv2.imshow('Webcam Feed', frame_with_faces)

        # Wait for key press
        key = cv2.waitKey(1) & 0xFF

        # Capture image when 's' or space is pressed
        if key == ord('s') or key == 32:  # Spacebar key code is 32
            video_capture.release()
            cv2.destroyAllWindows()
            if len(face_encodings) > 0:
                encoding = face_encodings[0].tolist()  # Capture the first detected face encoding
                return JSONResponse(content={"encoding": encoding}, status_code=200)
            else:
                return JSONResponse(content={"error": "No face detected."}, status_code=400)

        # Exit when 'q' is pressed
        elif key == ord('q'):
            video_capture.release()
            cv2.destroyAllWindows()
            return JSONResponse(content={"error": "Operation canceled by user."}, status_code=400)

# FastAPI route to save student to MongoDB
@app.post('/save_student')
async def save_student_to_mongodb(request: Request):
    data = await request.json()
    student_name = data.get("name")
    student_id = data.get("id")
    batch = data.get("batch")
    encoding = data.get("encoding")

    # Check if student already exists
    existing_student = collection.find_one({"id": student_id})
    if existing_student:
        return JSONResponse(content={"error": "Student ID already exists."}, status_code=400)

    # Save to MongoDB
    student_data = {
        "name": student_name,
        "id": student_id,
        "batch": batch,
        "encoding": encoding  # Already a list from JSON
    }

    collection.insert_one(student_data)
    return JSONResponse(content={"message": "Student data saved to MongoDB."}, status_code=200)

# FastAPI route to stream video feed
async def generate_video_feed():
    video_capture = cv2.VideoCapture(0)
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
        frame, _ = detect_and_draw_faces(frame)
        # Encode the frame in JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# Function to stream video frames
async def generate_video_feed():
    video_capture = cv2.VideoCapture(0)
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
        # Encode the frame in JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    video_capture.release()

@app.get('/video_feed')
async def video_feed():
    return StreamingResponse(generate_video_feed(), media_type='multipart/x-mixed-replace; boundary=frame')


@app.post('/api/upload/{class_id}')
async def upload_file(class_id: str, file: UploadFile = File(...)):
    # Define the path for the temporary directory
    temp_dir = "./temp"
    os.makedirs(temp_dir, exist_ok=True)  # Create the directory if it doesn't exist

    # Save the uploaded file temporarily
    temp_file_path = os.path.join(temp_dir, file.filename)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Load and process the image/video
    if file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        # Process image
        image = face_recognition.load_image_file(temp_file_path)
        result = await process_image(image, class_id)
    elif file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        # Process video
        result = await process_video(temp_file_path, class_id)
    else:
        result = {"error": "Unsupported file type."}
    
    shutil.rmtree(temp_dir)
    return JSONResponse(content=result, status_code=200 if 'error' not in result else 400)

async def process_image(image, class_id):
    known_face_encodings, known_face_names, known_face_ids = fetch_student_list(class_id)

    # Detect faces in the uploaded image
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)

    recognized_students = []
    for encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, encoding)
        if True in matches:
            first_match_index = matches.index(True)
            recognized_students.append({
                "name": known_face_names[first_match_index],
                "id": known_face_ids[first_match_index]
            })

    return {"recognized": recognized_students}

async def process_video(video_path, class_id):
    known_face_encodings, known_face_names, known_face_ids = fetch_student_list(class_id)

    # Open the video file
    video_capture = cv2.VideoCapture(video_path)
    recognized_students = set()  # Use a set to avoid duplicates

    while video_capture.isOpened():
        ret, frame = video_capture.read()
        if not ret:
            break

        # Detect faces in the frame
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, encoding)
            if True in matches:
                first_match_index = matches.index(True)
                recognized_students.add((
                    known_face_names[first_match_index],
                    known_face_ids[first_match_index]
                ))

    video_capture.release()
    os.remove(video_path)  # Clean up temporary file

    # Convert the set of tuples back into a list of dictionaries for the response
    recognized_list = [{"name": name, "id": student_id} for name, student_id in recognized_students]
    return {"recognized": recognized_list}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
