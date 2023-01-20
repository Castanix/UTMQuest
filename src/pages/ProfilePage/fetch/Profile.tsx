// import { message } from "antd";
import { useEffect, useState } from "react";

const GetProfile = (utorId: string, setName: Function) => {

    const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
    const [errorProfile, setErrorProfile] = useState('');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${utorId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setName(result.utorName);
                setLoadingProfile(false);
            }).catch((err) => {
                setErrorProfile(err.message);
                setLoadingProfile(false);
            });

    }, [setName, utorId]);

    return {
        loadingProfile,
        errorProfile
    };
};

export default GetProfile;


// Not currently updaing profile icon color
// export const UpdateProfile = (utorid: string, colour: string, setSavedColour: Function) => {
//         fetch(`${process.env.REACT_APP_API_URI}/account/updateColour`,
//             {
//                 method: 'PUT',
//                 redirect: "follow",
//                 mode: 'cors',
//                 cache: 'no-cache',
//                 credentials: 'same-origin',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ utorid, colour })
//             }).then((res: Response) => {
//                 if (!res.ok) throw Error(res.statusText);
//                 setSavedColour(colour);
//             }).catch((err) => {
//                 message.error(err);
//             });
// };