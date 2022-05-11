import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { storageService, dbService } from "fbase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { addDoc, serverTimestamp, collection } from "firebase/firestore";

const TweetFactory = ({ userObj }) => {
  const [tweet, setTweet] = useState("");
  const [attachment, setAttachment] = useState("");
  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentURL = "";
    if (attachment !== "") {
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(
        attachmentRef,
        attachment,
        "data_url"
      );
      attachmentURL = await getDownloadURL(response.ref);
    }
    const tweetObj = {
      text: tweet,
      createdAt: serverTimestamp(),
      creatorId: userObj.uid,
      attachmentURL,
    };
    await addDoc(collection(dbService, "tweets"), tweetObj);
    setTweet("");
    setAttachment("");
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setTweet(value);
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };
  const fileInput = useRef();
  const onClearAttachment = () => {
    setAttachment("");
    fileInput.current.value = "";
  };
  <form onSubmit={onSubmit}>
    <input
      value={tweet}
      onChange={onChange}
      type="text"
      placeholder="What's on your mind?"
      maxLength={120}
    />
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      ref={fileInput}
    />
    <input type="submit" value="Tweet" />
    {attachment && (
      <div>
        <img src={attachment} width="50px" height="50px" />
        <button onClick={onClearAttachment}>Clear</button>
      </div>
    )}
  </form>;
};

export default TweetFactory;
