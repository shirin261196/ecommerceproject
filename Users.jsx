import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App.jsx";
import { toast } from "react-toastify";

const Users = () => {
    const [users, setUsers] = useState([]); // State to store users

    useEffect(() => {
        axios.get(`${backendUrl}/admin/users`, {
            headers:
            {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        }).then((response) => {
            setUsers(response.data.data);
        });
    }, []);


    const toggleUserStatus = async (userId) => {

        try {
            const response = await axios.post(`${backendUrl}/admin/users/${userId}`,{}, {
                headers:
                 { Authorization: `Bearer ${localStorage.getItem('token')}`,
                 },
                });
                alert(response.data.message);
      // Update user status locally after toggle
      setUsers(users.map(user => user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user));
        } catch (error) {
            alert(error.response.data.message);
        }
    }



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
              <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
              <td>
                <button onClick={() => toggleUserStatus(user._id)}>
                  {user.isBlocked ? 'Unblock' : 'Block'}
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
