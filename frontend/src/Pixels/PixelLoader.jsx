import { useEffect } from "react";

export default function PixelLoader() {
    useEffect(() => {
        if (window.loadPixels) {
            window.loadPixels();
        }
    }, []);

    return null;
}