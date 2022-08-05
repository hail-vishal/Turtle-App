import React, { useState, useEffect, useContext } from "react";
import { userContext } from "../../App";
import { Link } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState([]);
  const { state, dispatch } = useContext(userContext);

  useEffect(() => {
    fetch("/allposts", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      });
  }, []);

  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((item) => {
          if (item._id === result._id) {
            return result;
          }
          return item;
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id === result._id) {
            return result;
          }
          return item;
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const makeComment = (text, postId) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text,
        postId,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id === result._id) {
            return result;
          }
          return item;
        });
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  const deleteComment = (postId, comment) => {
    fetch(`/deletecomment/${postId}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        comment,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((item) => {
          if (item._id === result._id) {
            return result;
          }
          return item;
        });
        setData(newData);
      });
  };

  const deletePost = (postId) => {
    fetch(`/deletepost/${postId}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="home">
      {data.map((item) => {
        console.log(item);
        return (
          <div className="card home-card" key={item._id}>
            <h5>
              <Link
                to={
                  item.postedBy._id !== state._id
                    ? "/profile/" + item.postedBy._id
                    : "/profile"
                }
              >
                <img
                  className="post-profile-pic"
                  src={item.postedBy.pic}
                  alt="profile-img"
                />
                <div className="postedby-name">{item.postedBy.name}</div>
              </Link>

              {item.postedBy._id === state._id && (
                <i
                  className="material-icons"
                  style={{ float: "right" }}
                  onClick={() => deletePost(item._id)}
                >
                  {" "}
                  delete
                </i>
              )}
            </h5>

            <div className="card-image">
              <img src={item.photo} alt="home-img" />
            </div>
            <div className="card-content">
              {item.likes.includes(state._id) ? (
                <i
                  className="material-icons"
                  style={{ color: "red" }}
                  onClick={() => unlikePost(item._id)}
                >
                  {" "}
                  favorite
                </i>
              ) : (
                <i
                  className="material-icons"
                  onClick={() => likePost(item._id)}
                >
                  favorite_border
                </i>
              )}

              <h6>{item.likes.length} Likes</h6>
              <h6>
                <b>{item.title}</b>
              </h6>
              <p>{item.body}</p>
              {item.comments.length > 0 && (
                <h6>
                  <i>Comments</i>
                </h6>
              )}
              {item.comments.map((record) => {
                return (
                  <h6 key={record._id}>
                    <span style={{ fontWeight: "500" }}>
                      {record.postedBy.name}
                    </span>{" "}
                    {record.text}
                    {record.postedBy._id === state._id && (
                      <i
                        className="material-icons"
                        style={{ float: "right" }}
                        onClick={() => deleteComment(item._id, record)}
                      >
                        {" "}
                        delete
                      </i>
                    )}
                  </h6>
                );
              })}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  makeComment(e.target[0].value, item._id);
                }}
              >
                <input type="text" placeholder="add a comment"></input>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
