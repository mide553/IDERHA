import React, { useState, useEffect } from 'react';
import '../css/ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', firstname: '', lastname: '', role: 'researcher' });
    const [editingUser, setEditingUser] = useState(null);
    const [originalEmail, setOriginalEmail] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []); const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users.');
            }
        } catch (err) {
            setError('Failed to fetch users.');
        }
    }; const handleAddUser = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                const addedUser = await response.json();
                setUsers((prevUsers) => [...prevUsers, addedUser]);
                setNewUser({ email: '', password: '', firstname: '', lastname: '', role: 'researcher' });
            } else {
                setError('Failed to add user.');
            }
        } catch (err) {
            setError('Failed to add user.');
        }
    }; const handleEditUser = async (user) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${originalEmail}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    password: user.password
                }),
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setUsers((prevUsers) => prevUsers.map((u) => (u.email === originalEmail ? updatedUser : u)));
                setEditingUser(null);
                setOriginalEmail(null);
            } else {
                setError('Failed to edit user.');
            }
        } catch (err) {
            setError('Failed to edit user.');
        }
    }; const handleDeleteUser = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${email}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.ok) {
                setUsers((prevUsers) => prevUsers.filter((u) => u.email !== email));
            } else {
                setError('Failed to delete user.');
            }
        } catch (err) {
            setError('Failed to delete user.');
        }
    };

    return (
        <div className="manageusers-main">
            <h1>Manage Users</h1>
            {error && <p className="error">{error}</p>}

            <div className="manageusers-form">
                <h2>Add New User</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="First Name"
                    value={newUser.firstname}
                    onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={newUser.lastname}
                    onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                </select>
                <button onClick={handleAddUser}>Add User</button>
            </div>

            <div className="manageusers-list">
                <h2>Existing Users</h2>
                {users.map((user) => (
                    <div key={user.email} className={`user-item ${editingUser && originalEmail === user.email ? 'editing' : ''}`}>                        {editingUser && originalEmail === user.email ? (
                        <div className="edit-user-form">
                            <p>Email</p>
                            <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                            <p>Password</p>
                            <input
                                type="password"
                                placeholder="Enter new password (leave empty to keep current)"
                                value={editingUser.password || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                            />
                            <p>Firstname</p>
                            <input
                                type="text"
                                value={editingUser.firstname}
                                onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })}
                            />
                            <p>Lastname</p>
                            <input
                                type="text"
                                value={editingUser.lastname}
                                onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}
                            />
                            <p>Role</p>
                            <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            >
                                <option value="researcher">Researcher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button className="save" onClick={() => handleEditUser(editingUser)}>Save</button>
                            <button className="cancel" onClick={() => {
                                setEditingUser(null);
                                setOriginalEmail(null);
                            }}>Cancel</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <button className="edit" onClick={() => {
                                setEditingUser(user);
                                setOriginalEmail(user.email);
                            }}>Edit</button>
                            <button onClick={() => handleDeleteUser(user.email)}>Delete</button>
                        </div>
                    )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageUsers;