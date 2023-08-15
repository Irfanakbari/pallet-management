import {Slide, toast} from "react-toastify";

const showErrorToast = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        transition: Slide,
        draggable: true,
        progress: false,
        theme: "colored",
        limit:2,
    });
};

const showSuccessToast = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: false,
        theme: "colored",
        limit:2,
    });
};

export {showErrorToast, showSuccessToast}