// module for common / frequently used UI methods

/* SOURCES:
 * [1] Game Development, "How can I find an optimum set of colors for 10 players?", Stack Exchange, stackexchange.com, [Online]. Available at: https://gamedev.stackexchange.com/questions/46463. Accessed: Mar. 1, 2026.
 * [2] Stack Overflow, "How to convert HSB/HSV color to RGB accurately?", Stack Exchange, stackexchange.com, [Online]. Available at: https://stackoverflow.com/questions/17242144. Accessed: Mar. 1, 2026.
 * [3] Prashant Yadav (2022), "Convert RGB to HEX color in JavaScript", LearnersBucket, learnersbucket.com, [Online]. Available at: https://learnersbucket.com/examples/interview/convert-rgb-to-hex-color-in-javascript/. Accessed: Mar. 1, 2026.
 */


import {
    TrackRenderer
} from "/core/index.js";


export default class GeneralUI {

    // returns a new toast with the given details
    // * assumes there's a toast partial on the source page!
    static createToast(title, message, colour) {
        let toast = document.querySelector(".toast");
        
        if(!toast) {
            throw new Error("No toast template on page");
        }

        let toastIcon = toast.querySelector(".toast-icon");
        let toastTitle = toast.querySelector(".toast-title");
        let toastBody = toast.querySelector(".toast-body");

        toastIcon.setAttribute("fill", colour);
        toastIcon.setAttribute("stroke", colour);
        toastTitle.innerHTML = title;
        toastBody.innerHTML = message;

        let bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // returns a colour from the given number
    // * designed to sequential colours which differ from each other
    static generateColourFromNumber(number) {
        const GOLDEN_RATIO = (1 + 5**0.5) / 2;

        // source 1
        let h = (number * GOLDEN_RATIO) % 1;
        let s = 0.75;
        let v = Math.sqrt(1 - ((number * GOLDEN_RATIO) % 0.5));

        // source 2
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);

        // source 3
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

        return hex;
    }

    // generates a number which doesn't already exist in the list
    static generateUniqueColourFromNumber(colours, number) {
        let colour;

        do {
            colour = GeneralUI.generateColourFromNumber(number);
            number += 1;
        } while (colours.find(c => c == colour))

        return colour;
    }

    // renders a basic track preview for the given canvas
    static generateTrackPreview(canvas, track, spacing) {
        let renderer = new TrackRenderer(track, canvas, spacing);
        renderer.setVisibility("nodes", false);
        renderer.setVisibility("wires", false);
        renderer.setScale(canvas.width / 750);
        renderer.redrawTrack();
    }

    // enables all tooltips on the page
    // * source: https://getbootstrap.com/docs/5.3/components/tooltips/
    static prepareTooltips(target = document) {
        let tooltips = target.querySelectorAll("[data-bs-toggle='tooltip']");

        tooltips.forEach(t => {
            new bootstrap.Tooltip(t, { trigger: "hover" })
        });
    }

    static clearTooltips(target = document) {
        let tooltips = target.querySelectorAll("[data-bs-toggle='tooltip']");

        tooltips.forEach(t => {
            bootstrap.Tooltip.getInstance(t)?.dispose();
        });
    }
}
