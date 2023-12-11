import React from 'react';
import '../css/FriendsList.css';

const friends = [
    // This array will be populated with friend data
    { id: 1, name: 'Alice', online: true },
    { id: 2, name: 'Bob', online: false },
    // Add more friend objects...
];

const FriendsList = () => {
    return (
        <div className="friends-list-container">
            <div className="search-container">
                <input type="text" placeholder="Search..." className="search-bar" />
            </div>
            <ul className="friends-list">
                {friends.map((friend) => (
                    <li key={friend.id} className="friend-item">
                        <span className={friend.online ? 'online-status' : 'offline-status'}></span>
                        <span className="friend-name">{friend.name}</span>
                        <button className="invite-button">Invite</button>
                    </li>
                ))}
            </ul>
            <div className="new-collab-container">
                <button className="new-collab-button">New Collaboration</button>
            </div>
        </div>
    );
};

export default FriendsList;
