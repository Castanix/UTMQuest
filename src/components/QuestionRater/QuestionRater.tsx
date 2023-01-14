import React from "react";
import { Button, Space, message, notification } from "antd";
import "./QuestionRater.css";

const addRating = (rate: number, link: string) => {
    fetch(`${process.env.REACT_APP_API_URI}/question/rating`,
            {
                method: 'PUT',
                redirect: "follow",
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rate, link })
            }).then((res: Response) => {
                if (!res.ok) throw new Error("Could not rate question. Please try again.");
                document.querySelector(".before")?.classList.toggle("active");
                document.querySelector(".after")?.classList.toggle("active");
                setTimeout(() => notification.destroy("unrated"), 1500);
            }).catch((error) => {
                message.error(error.message);
            });
};

const promptRater = () => {
    document.querySelector(".rated")?.classList.toggle("active");
    document.querySelector(".unrated")?.classList.toggle("active");
};

const QuestionRater = ({hasRated, link}: {hasRated: boolean, link: string}) =>
    <div className="rating-container">
        <div className={`rated ${hasRated ? "active" : ""}`}>
            <p>This question has been rated.</p>
            <Button onClick={promptRater}>Rate again?</Button>
        </div>
        <div className={`unrated ${hasRated ? "" : "active"}`}>
            <div className="before active">
                <p>Was this a good question?</p>
                <section className="rating-icons">
                    <Space size='large'>
                        <Button shape="round" onClick={() => addRating(0, link ?? '')}>No</Button>
                        <Button shape="round" onClick={() => addRating(1, link ?? '')}>Yes</Button>
                    </Space> 
                </section>
            </div>
            <div className="after">
                <p>Thank you for your feedback</p>
            </div>
        </div>
    </div>;

export default QuestionRater;