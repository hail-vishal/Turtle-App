import React, { useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import M from "materialize-css";

const Newpassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");

  console.log(token);
  const PostData = () => {
    fetch("/new-password", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        token,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          M.toast({ html: data.error, classes: "#d32f2f red darken-2" });
        } else {
          M.toast({
            html: data.message,
            classes: "#43a047 green darken-1",
          });
          navigate("/signin");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="mycard">
      <div className="card auth-card input-field">
        <h2>Instagram</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn #64b5f6 blue darken-1"
          onClick={() => PostData()}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default Newpassword;
