import React, { useEffect, useState } from 'react';

function FacebookAPI() {
    const [userData, setUserData] = useState('');

    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                xfbml: true, // social plugins
                cookie: true, // for sessions management
                version: 'v19.0',
            });
        }

            // d = documents, s = script
            (function (d, s, id) {
                if (d.getElementbyId(id)) return;
                const ele = d.createElement(s); //similar to <script>
                ele.id = id;
                ele.src = 'https://connect.facebook.net/en_US/sdk.js'; // load Facebook SDK
                // find the first <script> in the Facebook SDK Page
                const tagElement = d.getElementbyTagName(s)[0];
                // insert before the const tagElement
                tagElement.parentNode.insertBefore(ele, tagElement);
            })(documents, 'script', 'facebook-jssdk');
    }, []); // run only once

    const handleFacebookLogin = () => {
        if (!window.FB) {
            setError('Facebook SDK not loaded. Please try again.');
            return;
        }
        window.FB.login(
            function(response) {
                if (response.authResponse) {
                    window.FB.api('/me', {fields: 'name,email,picture'}, function(profile) {
                        // You can send profile info to your backend for further auth/registration
                        // For demo, just log in
                        setIsAuth(true);
                        navigate('/carlist', { replace: true });
                    });
                } else {
                    setError('Facebook login was unsuccessful. Please try again.');
                }
            },
            { scope: 'email,public_profile' }
        );
    };

    return (
        <div>

        </div>
    );
}

export default FacebookAPI;