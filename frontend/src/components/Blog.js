import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import '../css/blog.css';
import feelslike from './static/feels-like.svg';
import Humidity from './static/humidity.svg';
import Wind from './static/wind.svg';
import UV from './static/uv.svg';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPencil, faTrash, faShare, faFlag } from '@fortawesome/free-solid-svg-icons';



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

function Blog() {
    const [posts, setPosts] = useState([]);
    const [condoLatLng, setCondoLatLng] = useState(null);
    const [condoWeather, setCondoWeather] = useState(null);
    const [userLatLng, setUserLatLng] = useState(null);
    const [userWeather, setUserWeather] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [condoAddress, setCondoAddress] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [editingPost, setEditingPost] = useState(null); // for edit functionality
    const [showModal, setShowModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);


    const menuRefs = useRef({});

    const toggleMenu = (postId) => {
        setOpenMenuId((prev) => (prev === postId ? null : postId));
    };

    // Handle clicks outside the dropdown to close it
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
                    setOpenMenuId(null); // Close the menu
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [openMenuId]);

    const API_URL = process.env.REACT_APP_API_URL;
    const CONDO_ADDRESS = process.env.REACT_APP_CONDO_LOCATION;
    const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

    // Fetch blog posts
    const fetchPosts = async () => {
        const token = localStorage.getItem("token");
        try {
            const resp = await axios.get(`${API_URL}/api/blog/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(resp.data);
        } catch (e) {
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line
    }, [API_URL]);

    // Fetch condo location, address, and weather
    useEffect(() => {
        if (!CONDO_ADDRESS || !GOOGLE_API_KEY) return;

        const fetchCondoLocation = async () => {
            try {
                const locResp = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(CONDO_ADDRESS)}&key=${GOOGLE_API_KEY}`
                );
                const result = locResp.data.results[0];
                const lat = result.geometry.location.lat;
                const lng = result.geometry.location.lng;
                setCondoLatLng({ lat, lng });
                setCondoAddress(result.formatted_address);

                // 2. Get condo weather
                const weatherResp = await axios.get(
                    `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}&key=${GOOGLE_API_KEY}`
                );
                setCondoWeather(weatherResp.data);

            } catch (err) {
                setErrorMsg("Unable to load condo location or weather.");
            }
        };

        fetchCondoLocation();
    }, [CONDO_ADDRESS, GOOGLE_API_KEY]);

    // Fetch user location, address, and weather
    useEffect(() => {
        if (!GOOGLE_API_KEY) return;

        const fetchUserLocation = () => {
            if (!navigator.geolocation) {
                setErrorMsg("Geolocation is not supported by this browser.");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLatLng({ lat, lng });

                    // Get user weather
                    try {
                        const weatherResp = await axios.get(
                            `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}&key=${GOOGLE_API_KEY}`
                        );
                        setUserWeather(weatherResp.data);
                    } catch {
                        setUserWeather(null);
                    }

                    // Get user address
                    try {
                        const addrResp = await axios.get(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
                        );
                        setUserAddress(addrResp.data.results[0]?.formatted_address || "");
                    } catch {
                        setUserAddress("");
                    }
                },
                (error) => {
                    setErrorMsg("Unable to get your location.");
                }
            );
        };

        fetchUserLocation();
    }, [GOOGLE_API_KEY]);

    // Create Blog Post
    const handleCreateBlog = async (blogData, onSuccess, onError) => {
        try {
            const token = localStorage.getItem("token");
            const resp = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/blog/post`,
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

    // Edit Blog Post
    const handleEditBlog = async (blogId, blogData, onSuccess, onError) => {
        try {
            const token = localStorage.getItem("token");
            const resp = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/blog/${blogId}`,
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

    // Delete Blog Post
    const handleDeleteBlog = async (blogId, onSuccess, onError) => {
        try {
            const token = localStorage.getItem("token");
            const resp = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/blog/${blogId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (onSuccess) onSuccess(resp.data);
        } catch (err) {
            if (onError) onError(err);
        }
    };

    const weatherGradientMap = {
        SUNNY: 'linear-gradient(135deg, #f9d423, #ff4e50)',
        CLEAR: 'linear-gradient(135deg, #56ccf2, #2f80ed)',
        PARTLY_CLOUDY: 'linear-gradient(135deg,rgb(137, 181, 253),rgb(219, 244, 255))',
        MOSTLY_CLOUDY: 'linear-gradient(135deg,rgb(111, 146, 202),rgb(141, 217, 255))',
        LIGHT_RAIN: 'linear-gradient(135deg,rgb(73, 171, 217),rgb(156, 180, 225))',
        CLOUDY: 'linear-gradient(135deg, #757f9a, #d7dde8)',
        RAIN: 'linear-gradient(135deg, #314755, #26a0da)',
        THUNDERSTORM: 'linear-gradient(135deg, #141e30, #243b55)',
        SNOW: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
        FOG: 'linear-gradient(135deg, #bdc3c7, #2c3e50)',
        HAZE: 'linear-gradient(135deg, #d3cce3, #e9e4f0)',
        WINDY: 'linear-gradient(135deg, #acb6e5, #86fde8)',
        DEFAULT: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
    };

    function getWeatherGradient(weather) {
        if (!weather || !weather.weatherCondition) return weatherGradientMap.DEFAULT;
        const type = weather.weatherCondition.type;
        return weatherGradientMap[type] || weatherGradientMap.DEFAULT;
    }

    const UVGradientMap = {
        low: "linear-gradient(180deg,rgba(139, 220, 139, 0.8),rgba(165, 240, 133, 0.8))", // <2
        medium: "linear-gradient(180deg, #a5e6a5cc, #7ed957cc)",   // 3-5 Green
        high: "linear-gradient(180deg, #fffaa5cc, #ffe066cc)",     // 6-7 Yellow
        veryHigh: "linear-gradient(180deg, #ffd19acc, #ff8c42cc)", // 8-10 Orange
        extreme: "linear-gradient(180deg, #ffaea5cc, #ff3b3bcc)",  // 11+ Red
    };

    function getUVGradient(weather) {
        const uv = weather?.uvIndex ?? 0;
        if (uv < 3) return UVGradientMap.low;
        if (uv < 6) return UVGradientMap.medium;
        if (uv < 8) return UVGradientMap.high;
        if (uv < 11) return UVGradientMap.veryHigh;
        return UVGradientMap.extreme;
    }

    // Helper to display weather info in Bootstrap card
    const WeatherCard = ({ title, address, latLng, weather }) => {
        if (!weather) {
            return (
                <div className="card mb-3 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div>Loading weather...</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="card mb-3 shadow weather-card" style={{ background: getWeatherGradient(weather), color: "#222" }}>
                <div className="card-body d-flex align-items-center">
                    <div className="me-3" style={{ minWidth: 64 }}>
                        <img
                            src={weather.weatherCondition?.iconBaseUri + ".svg"}
                            alt={weather.weatherCondition?.description?.text}
                            className="img-fluid"
                            style={{ width: 48, height: 48 }}
                        />
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="card-title mb-1 fw-bolder">{title}</h5>
                        <div className="card-text small address-text mb-1">
                            {address}
                        </div>
                        <div className="mb-1 temp-condition">
                            <span className="fw-bold fs-4">{weather.temperature?.degrees}°C</span>
                            <span className="ms-4">
                                {weather.weatherCondition?.description?.text}
                            </span>
                        </div>
                        <div className="row g-2">
                            <div className="col-auto">
                                <span title="Feels Like" className="badge text-dark fltemp-weather-badge weather-badge">
                                    <img src={feelslike} className="weather-icon" alt="feelslikeIcon" />
                                    {weather.feelsLikeTemperature?.degrees}°C
                                </span>
                            </div>
                            <div className="col-auto">
                                <span title="Humidity" className="badge text-dark hum-weather-badge weather-badge">
                                    <img src={Humidity} className="weather-icon" alt="HumidityIcon" />
                                    {weather.relativeHumidity}%
                                </span>
                            </div>
                            <div className="col-auto">
                                <span title="Wind" className="badge text-dark wind-weather-badge weather-badge">
                                    <img src={Wind} className="weather-icon" alt="WindIcon" />
                                    {weather.wind?.speed?.value} Km/h
                                </span>
                            </div>
                            <div className="col-auto">
                                <span title="UV Index" className="badge text-dark uv-weather-badge weather-badge" style={{ background: getUVGradient(weather), color: "#222" }} >
                                    <img src={UV} className="weather-icon" alt="UVIcon" />
                                    {weather.uvIndex}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const token = localStorage.getItem("token");
    let userId = null;
    if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
    }

    return (
        <div className="container-fluid bg-body-tertiary row main-container">
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            <div className="col-3">
                <div className="container-fluid weather-container mt-3">
                    <WeatherCard
                        title="ABC Condo"
                        address={condoAddress || CONDO_ADDRESS}
                        latLng={condoLatLng}
                        weather={condoWeather}
                    />
                    <WeatherCard
                        title="Current Location"
                        address={userAddress || "Loading..."}
                        latLng={userLatLng}
                        weather={userWeather}
                    />
                </div>
            </div>

            <div className="col-7 mt-4">
                <div className="row">
                    <div className="col">
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
                                            <img src={post.authorImage} alt={post.authorName} style={{ maxHeight: 55, objectFit: "cover" }} />
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
                                    <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{post.content}</p>                                </div>
                                {post.image &&
                                    <img src={post.image} className="card-img-middle" alt={post.title} style={{ maxHeight: 1080, objectFit: "cover" }} />}
                                <div className="card-body">
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Blog;