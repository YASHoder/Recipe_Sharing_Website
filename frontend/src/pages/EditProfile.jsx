import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

export default function EditProfile() {

    const navigate = useNavigate();

    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [image,setImage]=useState("");

    useEffect(()=>{

        const user=JSON.parse(localStorage.getItem("currentUser"));

        if(!user){
            navigate("/login");
            return;
        }

        setName(user.name);
        setEmail(user.email);
        setImage(user.profileImage);

    },[]);

    const uploadImage=(e)=>{

        const file=e.target.files[0];

        if(!file) return;

        const reader=new FileReader();

        reader.onload=()=>{

            setImage(reader.result);

        }

        reader.readAsDataURL(file);

    }

    const saveProfile=()=>{

        const users=JSON.parse(localStorage.getItem("users"))||[];

        const updatedUsers=users.map(user=>{

            if(user.email===email){

                return{
                    ...user,
                    name,
                    profileImage:image
                }

            }

            return user;

        });

        localStorage.setItem(
            "users",
            JSON.stringify(updatedUsers)
        );

        const currentUser={
            ...JSON.parse(localStorage.getItem("currentUser")),
            name,
            profileImage:image
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        alert("Profile Updated");

        navigate("/profile");

    }

    return(

        <div className="edit-profile">

            <div className="edit-card">

                <h2>Edit Profile</h2>

                <img
                src={image}
                className="preview"
                alt=""
                />

                <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                />

                <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Name"
                />

                <input
                value={email}
                disabled
                />

                <button
                onClick={saveProfile}
                >
                    Save Changes
                </button>

            </div>

        </div>

    )

}