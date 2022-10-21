const AddCourse = async (courseId: string) => {
    const res = await fetch(`${process.env.REACT_APP_API_URI}/course/`,
    {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({courseId})
    })

    return res;
}

export default AddCourse