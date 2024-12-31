import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../App.jsx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Pagination } from "react-bootstrap";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10); // You can change this to any number

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
                toast.success(response.data.message);
                setUsers(users.map(user => user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user));
                Swal.fire({
                    title: "Success!",
                    text: `User has been ${isBlocked ? "unblocked" : "blocked"} successfully.`,
                    icon: "success",
                });
            } catch (error) {
                toast.error(error.response?.data?.message || "Error toggling user status");
            }
        }
    };

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid">
            <h3 className="my-4">User List</h3>

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
                        {currentUsers.map((user) => (
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

            {/* Pagination Controls */}
            <Pagination>
                {[...Array(Math.ceil(users.length / usersPerPage))].map((_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default Users;
