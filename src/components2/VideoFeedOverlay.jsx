import React, { useState } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';

const VideoFeedOverlay = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="video-feed-overlay-title"
      aria-describedby="video-feed-overlay-description"
    >
      <Box sx={styles.modalContainer}>
        <Typography id="video-feed-overlay-title" variant="h6" align="center">
          Live Video Feed
        </Typography>
        <iframe
          src="http://localhost:8000/video_feed"
          style={styles.videoFrame}
          title="Video Feed"
        />
        <Button
          variant="contained"
          color="secondary"
          sx={styles.closeButton}
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '8px',
  },
  videoFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    marginTop: '10px',
    marginBottom: '10px',
  },
  closeButton: {
    marginTop: '20px',
  },
};

export default VideoFeedOverlay;
