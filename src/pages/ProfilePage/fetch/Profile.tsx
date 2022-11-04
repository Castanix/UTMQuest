import { message } from "antd";
import { useEffect, useState } from "react";

export const GetProfile = (utorid: string, setName: Function, setColour: Function, setBadges: Function) => {

    const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
    const [errorProfile, setErrorProfile] = useState('');

    useEffect(() => {
            fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${utorid}`)
                .then((res: Response) => {
                    console.log('he');
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then((result) => {
                    console.log("aklsnd");
                    setName(result.utorName);
                    setColour(result.colour);
                    setBadges(result.badges);
                    setLoadingProfile(false);
                }).catch((err) => {
                    console.log("error");
                    setErrorProfile(err.message);
                    setLoadingProfile(false);
                });

    }, [utorid, setBadges, setColour, setName]);

    return {
        loadingProfile,
        errorProfile
    };
};

export const UpdateProfile = (utorid: string, colour: string, setColour: Function) => {
        fetch(`${process.env.REACT_APP_API_URI}/account/updateColour`,
            {
                method: 'PUT',
                redirect: "follow",
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ utorid, colour })
            }).then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                setColour(colour);
            }).catch((err) => {
                message.error(err);
            });
};