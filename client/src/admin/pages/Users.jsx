import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../App.jsx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Users = () => {
    const [users, setUsers] = useState([]); // State to store users

    useEffect(() => {
        axios.get(`${backendUrl}/admin/users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
        }).then((response) => {
            setUsers(response.data.data);
        }).catch((error) => {
            toast.error(error.response?.data?.message || "Error fetching users");
        });
    }, []);

    const toggleUserStatus = async (userId, isBlocked) => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: isBlocked ? "Unblock User?" : "Block User?",
            text: `Are you sure you want to ${isBlocked ? "unblock" : "block"} this user?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isBlocked ? "Yes, Unblock!" : "Yes, Block!",
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axios.put(
                    `${backendUrl}/admin/users/${userId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                    }
                );
    
                toast.success(response.data.message); // Show success message
    
                // Update user status locally after toggle
                setUsers(users.map(user => user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user));
    
                // Show confirmation success with SweetAlert
                Swal.fire({
                    title: "Success!",
                    text: `User has been ${isBlocked ? "unblocked" : "blocked"} successfully.`,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                });
            } catch (error) {
                toast.error(error.response?.data?.message || "Error toggling user status");
            }
        }
    };

    return (
        <div className="container-fluid">
            <h3 className="my-4">User List</h3>

            {/* Table for displaying users */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.isBlocked ? "Blocked" : "Active"}</td>
                                <td>
                                <button onClick={() => toggleUserStatus(user._id, user.isBlocked)}>
    {user.isBlocked ? "Unblock" : "Block"}
</button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
