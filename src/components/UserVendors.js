import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditVendorModal from './EditVendorModal';

const UserVendors = ({ userEmail }) => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URI}/api/user_vendors?email=${userEmail}`)
            .then(response => response.json())
            .then(data => setVendors(data))
            .catch(error => console.error('Error fetching vendors:', error));
    }, [userEmail]);

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleDelete = (vendorId) => {
        fetch(`${process.env.REACT_APP_BACKEND_URI}/api/vendor/${vendorId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
        })
            .then(response => response.json())
            .then(() => setVendors(vendors.filter(vendor => vendor.id !== vendorId)))
            .catch(error => console.error('Error deleting vendor:', error));
    };

    const handleSave = (updatedVendor) => {
        fetch(`${process.env.REACT_APP_BACKEND_URI}/api/vendor/${updatedVendor.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...updatedVendor, email: userEmail })
        })
            .then(response => response.json())
            .then(() => {
                setVendors(vendors.map(vendor => vendor.id === updatedVendor.id ? updatedVendor : vendor));
                setIsModalOpen(false);
            })
            .catch(error => console.error('Error updating vendor:', error));
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom align="center">Your Vendors</Typography>
            <List>
                {vendors.map(vendor => (
                    <ListItem key={vendor.id} divider>
                        <ListItemText primary={vendor.name} secondary={vendor.location} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(vendor)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(vendor.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            {selectedVendor && (
                <EditVendorModal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    vendor={selectedVendor}
                    onSave={handleSave}
                />
            )}
        </Box>
    );
};

export default UserVendors;
