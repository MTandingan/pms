import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUtilStore = defineStore('util', () => {
    const snackBar = ref({
        showModal: false,
        modalDescription: ""
    });

    const customDialog = ref({
        showDialog: false,
        modalTitle: "",
        modalDescription: ""
    });

    const photoDialog = ref({
        showDialog: false,
        modalSrc: null
    })

    const isPageLoading = ref(false);

    const setSnackBar = (params) => {
        const {showModal, modalDescription} = params;

        snackBar.value.showModal = showModal;
        snackBar.value.modalDescription = modalDescription;
    }

    const setCustomDialog = (params) => {
        const {showDialog, modalTitle, modalDescription} = params;

        customDialog.value.showDialog = showDialog;
        customDialog.value.modalTitle = modalTitle;
        customDialog.value.modalDescription = modalDescription;
    }

    const setPhotoDialog = (params) => {
        const {showDialog, modalSrc} = params;

        photoDialog.value.showDialog = showDialog;
        photoDialog.value.modalSrc = modalSrc;
    }

    const scrollToTop = () => {
        const topPointer = document.querySelector('#top');

        if (topPointer) {
            topPointer.scrollTo(0, 0);
        }
    }

    const setPageLoading = (params) => {
        const { pIsPageLoading } = params;

        isPageLoading.value = pIsPageLoading;
    }

    return {
        snackBar,
        customDialog,
        photoDialog,
        isPageLoading,
        setSnackBar,
        setCustomDialog,
        setPhotoDialog,
        setPageLoading
    };
})