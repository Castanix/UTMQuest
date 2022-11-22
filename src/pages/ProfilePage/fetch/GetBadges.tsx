import { useEffect, useState } from "react";


const GetBadges = (utorid: string, setBadges: Function) => {

    const [loadingBadges, setLoadingBadges] = useState<boolean>(true);
    const [errorBadges, setErrorBadges] = useState('');


    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/badge/userBadges/${utorid}`)
            .then(res => {
                if (!res.ok) throw Error(res.statusText);

                return res.json();
            }).then(result => {
                setBadges({unlockedBadges: result.unlockedBadges, displayBadges: result.displayBadges, longestLoginStreak: result.longestLoginStreak});
                setLoadingBadges(false);
            }).catch((err) => {
                setErrorBadges(err.message);
                setLoadingBadges(false);
            });
    }, [setBadges, utorid]);

    return {
        loadingBadges, 
        errorBadges
    };
};


export default GetBadges;