import React, { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";

const Profile = () => {
  const [myPosts, setmyPosts] = useState([]);
  const [image, setImage] = useState("");

  const { state, dispatch } = useContext(userContext);

  useEffect(() => {
    fetch("/myposts", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setmyPosts(result.myposts);
      });
  }, []);

  useEffect(() => {
    if (image) {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "insta-clone");
      data.append("cloud_name", "hailvishal");
      fetch("https://api.cloudinary.com/v1_1/hailvishal/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          fetch("/updatepic", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
              pic: data.url,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(result);
              localStorage.setItem(
                "user",
                JSON.stringify({
                  ...state,
                  pic: result.pic,
                })
              );
              dispatch({ type: "UPDATEPIC", payload: result.pic });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [image]);

  const updatePhoto = (file) => {
    setImage(file);
  };
  return (
    <div style={{ maxWidth: "550px", margin: "0px auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "18px 0px",
          borderBottom: "1px solid grey",
        }}
      >
        <div>
          <img
            style={{ width: "160px", height: "160px", borderRadius: "80px" }}
            src={state ? state.pic : ""}
            alt="profile-img"
          />
          <div
            className="file-field input-field"
            style={{ marginBottom: "10px" }}
          >
            <div className="btn #64b5f6 blue darken-1">
              <span>Update profile pic</span>
              <input
                type="file"
                onChange={(e) => updatePhoto(e.target.files[0])}
              />
            </div>
            <div className="file-path-wrapper">
              <input className="file-path validate" type="text" />
            </div>
          </div>
        </div>
        <div>
          <h4>{state ? state.name : "loading..."}</h4>
          <h5>{state ? state.email : "loading..."}</h5>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "108%",
            }}
          >
            <h5>{myPosts.length} posts</h5>
            <h5>{state ? state.followers.length : "0"} followers</h5>
            <h5>{state ? state.following.length : "0"} following</h5>
          </div>
        </div>
      </div>
      <div className="gallery">
        {myPosts.map((item) => {
          return (
            <img
              key={item._id}
              alt={item.title}
              className="item"
              src={item.photo}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
