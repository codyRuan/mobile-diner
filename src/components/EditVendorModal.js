import React, { useState, useEffect } from 'react';
import { useMediaQuery, Modal, TextField, Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const formatTime = (time) => time.substring(0, 5); // Assuming time is in HH:MM:SS format

const EditVendorModal = ({ isOpen, onRequestClose, vendor, onSave }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    const [name, setName] = useState(vendor?.name || '');
    const [link, setLink] = useState(vendor?.link || '');
    const [latitude, setLatitude] = useState(vendor?.latitude || 0);
    const [longitude, setLongitude] = useState(vendor?.longitude || 0);
    const [schedules, setSchedules] = useState([]);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);

    useEffect(() => {
        if (vendor) {
            setName(vendor.name);
            setLink(vendor.link);
            setLatitude(vendor.latitude);
            setLongitude(vendor.longitude);

            // Fetch schedules for the given vendor
            fetch(`${process.env.REACT_APP_BACKEND_URI}/api/vendor/${vendor.id}/schedules`)
                .then(response => response.json())
                .then(data => {
                    setSchedules(data);
                })
                .catch(error => {
                    console.error('Error fetching schedules:', error);
                });
        }
    }, [vendor]);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedLocation = JSON.parse(localStorage.getItem('updatedLocation'));
            if (updatedLocation) {
                setLatitude(updatedLocation.latitude);
                setLongitude(updatedLocation.longitude);
                setEditingSchedule((prev) => ({
                    ...prev,
                    latitude: updatedLocation.latitude,
                    longitude: updatedLocation.longitude,
                    address: updatedLocation.address,
                }));
                localStorage.removeItem('updatedLocation');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleSave = () => {
        onSave({
            ...vendor,
            name,
            link,
            latitude,
            longitude,
            schedules
        });
        onRequestClose();
    };

    const handleAddSchedule = () => {
        const now = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        const formatTime = (date) => date.toTimeString().split(' ')[0].substring(0, 5);

        setSchedules([
            ...schedules,
            {
                id: `temp-${Date.now()}`, // Temporary ID for new schedules
                start_date: formatDate(now),
                start_time: formatTime(now),
                end_date: formatDate(now),
                end_time: formatTime(now),
                latitude: 24.896,
                longitude: 121.327,
                address: 'Select new address...'
            }
        ]);
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
    };

    const handleSaveSchedule = () => {
        const updatedSchedules = schedules.map(schedule =>
            schedule.id === editingSchedule.id ? editingSchedule : schedule
        );
        setSchedules(updatedSchedules);
        setEditingSchedule(null);
    };

    const handleDeleteSchedule = (id) => {
        if (id.startsWith('temp-')) {
            // If the schedule is newly added, just remove it from the local state
            setSchedules(schedules.filter(schedule => schedule.id !== id));
        } else {
            setScheduleToDelete(id);
            setDeleteDialogOpen(true);
        }
    };

    const confirmDeleteSchedule = () => {
        fetch(`${process.env.REACT_APP_BACKEND_URI}/api/schedule/${scheduleToDelete}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    setSchedules(schedules.filter(schedule => schedule.id !== scheduleToDelete));
                    setDeleteDialogOpen(false);
                    setScheduleToDelete(null);
                } else {
                    console.error('Error deleting schedule:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting schedule:', error);
            });
    };

    const handleChangeLocation = (schedule) => {
        localStorage.setItem('editingSchedule', JSON.stringify(schedule));
        window.open('/edit-location', '_blank');
    };

    return (
        <>
            <Modal open={isOpen} onClose={onRequestClose}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isMobile ? '90%' : 600,
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    outline: 0,
                    overflow: 'auto'
                }}>
                    <Typography variant="h6" gutterBottom>Edit Vendor</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Vendor Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Order Link"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                    />
                    <Box mt={2}>
                        <Typography variant="h6">Schedules</Typography>
                        <List>
                            {schedules?.map((schedule) => (
                                <ListItem key={schedule.id} divider>
                                    <ListItemText
                                        primary={`From: ${schedule.start_date} ${formatTime(schedule.start_time)} To: ${schedule.end_date} ${formatTime(schedule.end_time)}`}
                                        secondary={`Location: ${schedule.address}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditSchedule(schedule)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSchedule(schedule.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                        <Button variant="contained" color="primary" onClick={handleAddSchedule}>
                            Add Schedule
                        </Button>
                    </Box>
                    {editingSchedule && (
                        <Box mt={2}>
                            <Typography variant="h6">Edit Schedule</Typography>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Start Date"
                                type="date"
                                value={editingSchedule.start_date}
                                onChange={e => setEditingSchedule({
                                    ...editingSchedule,
                                    start_date: e.target.value
                                })}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Start Time"
                                type="time"
                                value={formatTime(editingSchedule.start_time)}
                                onChange={e => setEditingSchedule({
                                    ...editingSchedule,
                                    start_time: e.target.value
                                })}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="End Date"
                                type="date"
                                value={editingSchedule.end_date}
                                onChange={e => setEditingSchedule({
                                    ...editingSchedule,
                                    end_date: e.target.value
                                })}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="End Time"
                                type="time"
                                value={formatTime(editingSchedule.end_time)}
                                onChange={e => setEditingSchedule({
                                    ...editingSchedule,
                                    end_time: e.target.value
                                })}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Address"
                                value={editingSchedule.address}
                                disabled
                            />
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleChangeLocation(editingSchedule)}
                                sx={{ mt: 2 }}
                            >
                                Change Address
                            </Button>
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button variant="contained" color="primary" onClick={handleSaveSchedule}>
                                    Save Schedule
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => setEditingSchedule(null)} sx={{ ml: 2 }}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {!editingSchedule && (
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                Save Vendor
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={onRequestClose} sx={{ ml: 2 }}>
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this schedule? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteSchedule} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditVendorModal;
