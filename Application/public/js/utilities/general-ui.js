// module for common / frequently used UI methods



// [[ Toast Functions ]] //

// returns a new toast with the given details
export default function createToast(title, message, state) {
    return document.createElement(`
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                <div class="rounded-circle me-2" style='background-colour:${state};'>
                ${message}
            </div>
        </div>
    `);
}