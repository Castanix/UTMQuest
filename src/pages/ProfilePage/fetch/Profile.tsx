// import { message } from "antd";
import { useQuery } from "react-query";

const fetchAccount = async (userId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${userId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};


const GetProfile = (userId: string) => {

    const result = useQuery("getAccount", () => fetchAccount(userId));

    return {
        loadingProfile: result.isLoading,
        errorProfile: result.error,
        utorName: result.data?.utorName
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