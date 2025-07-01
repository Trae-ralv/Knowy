import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import '../css/blog.css';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPencil, faTrash, faShare, faFlag, faUserEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const BlogModal = ({ show, initialData = {}, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(initialData.title || "");
    const [content, setContent] = useState(initialData.content || "");
    const [image, setImage] = useState(initialData.image || "");

    useEffect(() => {
        setTitle(initialData.title || "");
        setContent(initialData.content || "");
        setImage(initialData.image || "");
    }, [initialData, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, content, image });
    };

    return (
        <div className="modal-backdrop" st>
            <div className={`modal fade ${show ? "show" : ""}`} style={{ display: show ? "block" : "none" }} tabIndex="-1" aria-modal="true" role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">{initialData.id ? "Edit Blog Post" : "New Blog Post"}</h5>
                                <button type="button" className="btn-close" onClick={onCancel}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-2">
                                    <label className="form-label">Title</label>
                                    <input
                                        className="form-control"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Content</label>
                                    <textarea
                                        className="form-control form-textarea"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        required
                                        rows={5}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Image URL (optional)</label>
                                    <input
                                        className="form-control"
                                        value={image}
                                        onChange={e => setImage(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary me-2">
                                    {initialData && initialData.id ? "Update" : "Post"}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Profile() {
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editProfile, setEditProfile] = useState({});
    const [errorMsg, setErrorMsg] = useState("");
    const [editingPost, setEditingPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    const menuRefs = useRef({});

    const API_URL = process.env.REACT_APP_API_URL;

    // Get userId from JWT
    const token = localStorage.getItem("token");
    let userId = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.userId;
        } catch {
            userId = null;
        }
    }

    // Fetch user profile
    const fetchProfile = async () => {
        if (!userId || !token) return;
        try {
            const resp = await axios.get(`${API_URL}/api/profile/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(resp.data);
            setEditProfile(resp.data);
        } catch (e) {
            setProfile(null);
            setErrorMsg("Unable to load profile.");
        }
    };

    // Fetch user's blog posts
    const fetchPosts = async () => {
        if (!userId || !token) return;
        try {
            const resp = await axios.get(`${API_URL}/api/profile/blog/list/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(resp.data);
        } catch (e) {
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchPosts();
        // eslint-disable-next-line
    }, [API_URL, userId]);

    // Blog CRUD
    const handleCreateBlog = async (blogData, onSuccess, onError) => {
        try {
            const resp = await axios.post(
                `${API_URL}/api/blog/post`,
                blogData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (onSuccess) onSuccess(resp.data);
        } catch (err) {
            if (onError) onError(err);
        }
    };

    const handleEditBlog = async (blogId, blogData, onSuccess, onError) => {
        try {
            const resp = await axios.put(
                `${API_URL}/api/blog/${blogId}`,
                blogData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (onSuccess) onSuccess(resp.data);
        } catch (err) {
            if (onError) onError(err);
        }
    };

    const handleDeleteBlog = async (blogId, onSuccess, onError) => {
        try {
            const resp = await axios.delete(
                `${API_URL}/api/blog/${blogId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (onSuccess) onSuccess(resp.data);
        } catch (err) {
            if (onError) onError(err);
        }
    };

    // Handle edit profile
    const handleProfileChange = (e) => {
        setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${API_URL}/api/profile/${userId}`,
                editProfile,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile(editProfile);
            setEditMode(false);
            setErrorMsg("");
        } catch (err) {
            setErrorMsg("Failed to update profile.");
        }
    };

    // Dropdown menu logic
    const toggleMenu = (postId) => {
        setOpenMenuId((prev) => (prev === postId ? null : postId));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId !== null) {
                const menuElement = menuRefs.current[openMenuId];
                const buttonElement = document.getElementById(`postActions-${openMenuId}`);
                if (
                    menuElement &&
                    !menuElement.contains(event.target) &&
                    buttonElement &&
                    !buttonElement.contains(event.target)
                ) {
                    setOpenMenuId(null);
                }
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [openMenuId]);

    return (
        <div className="container-fluid bg-body-tertiary row main-container">
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {/* Left Section: Profile Edit */}
            <div className="col-3">
                <div className="card mt-3 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-2">My Profile</h4>
                            {!editMode &&
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditMode(true)}>
                                    <FontAwesomeIcon icon={faUserEdit} /> Edit
                                </button>
                            }
                        </div>
                        {profile && !editMode ? (
                            <div>
                                <div className="mb-3 text-center">
                                    <img src={profile.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name || profile.email)} alt="Profile" className="rounded-circle" style={{ width: 80, height: 80, objectFit: "cover" }} />
                                </div>
                                <div className="mb-2">
                                    <strong>Name:</strong> {profile.name}
                                </div>
                                <div className="mb-2">
                                    <strong>Email:</strong> {profile.email}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleProfileSave}>
                                <div className="mb-3 text-center">
                                    <img src={editProfile.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(editProfile.name || editProfile.email)} alt="Profile" className="rounded-circle" style={{ width: 80, height: 80, objectFit: "cover" }} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input className="form-control" name="name" value={editProfile.name || ""} onChange={handleProfileChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input className="form-control" name="email" value={editProfile.email || ""} onChange={handleProfileChange} required disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Profile Image URL</label>
                                    <input className="form-control" name="image" value={editProfile.image || ""} onChange={handleProfileChange} />
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button className="btn btn-success" type="submit">
                                        <FontAwesomeIcon icon={faSave} /> Save
                                    </button>
                                    <button className="btn btn-secondary" type="button" onClick={() => { setEditMode(false); setEditProfile(profile); }}>
                                        <FontAwesomeIcon icon={faTimes} /> Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            {/* Right Section: Blog List */}
            <div className="col-7 mt-4">
                <div className="row">
                    <div className="col">
                        <h3>My Blog Posts</h3>
                    </div>
                    <div className="col text-end">
                        <div className="mb-3">
                            {!showModal && (
                                <button className="btn bg-dark text-white" onClick={() => {
                                    setEditingPost(null);
                                    setShowModal(true);
                                }}>
                                    Create New Blog <FontAwesomeIcon icon="fa-solid fa-plus" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {showModal && (
                    <BlogModal
                        show={showModal}
                        initialData={editingPost || {}}
                        onSubmit={async (data) => {
                            if (editingPost) {
                                await handleEditBlog(editingPost.id, data,
                                    () => {
                                        setShowModal(false);
                                        setEditingPost(null);
                                        fetchPosts();
                                    },
                                    () => alert("Failed to update blog post.")
                                );
                            } else {
                                await handleCreateBlog(data,
                                    () => {
                                        setShowModal(false);
                                        fetchPosts();
                                    },
                                    () => alert("Failed to create blog post.")
                                );
                            }
                        }}
                        onCancel={() => {
                            setShowModal(false);
                            setEditingPost(null);
                        }}
                    />
                )}
                <div className="blog-post">
                    {posts.length === 0 ? (
                        <p>No blog posts yet.</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="card mb-3 blog-card shadow">
                                <div className="card-header">
                                    <div className="row d-flex align-items-center">
                                        <div className="col-2">
                                            <img src={post.authorImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.authorName)} alt={post.authorName} style={{ width: 50, height: 50, objectFit: "cover" }} />
                                        </div>
                                        <div className="col-7 p-0">
                                            <h5>{post.authorName}</h5>
                                            <p className="card-subtitle mb-2 text-muted">
                                                on {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="col text-end p-2 pb-5">
                                            {String(post.authorId) === String(userId) ? (
                                                <div className="">
                                                    <button
                                                        className="btn btn-sm p-0"
                                                        type="button"
                                                        id={`postActions-${post.id}`}
                                                        aria-expanded={openMenuId === post.id}
                                                        onClick={() => toggleMenu(post.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faEllipsis} />
                                                    </button>
                                                    <div
                                                        className={`blog-action-${post.id} dropdown-menu${openMenuId === post.id ? " show" : ""}`}
                                                        aria-labelledby={`postActions-${post.id}`}
                                                        style={{ position: "absolute", zIndex: 10 }}
                                                        ref={(el) => (menuRefs.current[post.id] = el)}
                                                    >
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                setEditingPost(post);
                                                                setShowModal(true);
                                                            }}>
                                                            <FontAwesomeIcon icon={faPencil} className="me-2" /> Edit Post
                                                        </button>
                                                        <button
                                                            className="dropdown-item text-danger"
                                                            onClick={async () => {
                                                                if (window.confirm("Are you sure you want to delete this post?")) {
                                                                    await handleDeleteBlog(
                                                                        post.id,
                                                                        () => fetchPosts(),
                                                                        () => alert("Failed to delete post.")
                                                                    );
                                                                }
                                                            }}>
                                                            <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete Post
                                                        </button>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(window.location.href);
                                                                alert("Post link copied to clipboard!");
                                                            }}>
                                                            <FontAwesomeIcon icon={faShare} className="me-2" /> Share Post
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="">
                                                    <button
                                                        className="btn btn-sm p-0"
                                                        type="button"
                                                        id={`postActions-${post.id}`}
                                                        aria-expanded={openMenuId === post.id}
                                                        onClick={() => toggleMenu(post.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faEllipsis} />
                                                    </button>
                                                    <div
                                                        className={`blog-action-${post.id} dropdown-menu${openMenuId === post.id ? " show" : ""}`}
                                                        aria-labelledby={`postActions-${post.id}`}
                                                        style={{ position: "absolute", zIndex: 10 }}
                                                        ref={(el) => (menuRefs.current[post.id] = el)}
                                                    >
                                                        <button
                                                            className="dropdown-item text-warning"
                                                            onClick={() => alert("Post reported!")}>
                                                            <FontAwesomeIcon icon={faFlag} className="me-2" /> Report Post
                                                        </button>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(window.location.href);
                                                                alert("Post link copied to clipboard!");
                                                            }}>
                                                            <FontAwesomeIcon icon={faShare} className="me-2" /> Share Post
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="card-title">{post.title}</p>
                                    <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
                                </div>
                                {post.image &&
                                    <img src={post.image} className="card-img-middle" alt={post.title} style={{ maxHeight: 1080, objectFit: "cover" }} />}
                                <div className="card-body"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;