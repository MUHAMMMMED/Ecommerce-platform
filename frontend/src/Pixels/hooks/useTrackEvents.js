
export const useTrackEvents = () => {
    const trackEvent = (eventName, data = {}) => {
        try {
            // console.log("Tracking Event:", eventName, data);

            // Facebook Pixel
            if (window.fbq) {
                let fbData = {
                    content_ids: [data.id],
                    content_type: "product",
                    value: data.price,
                    currency: data.currency || "SAR",
                };
                if (eventName === "Search") fbData = { search_string: data.query };
                if (eventName === "CompleteRegistration")
                    fbData = { content_name: "Subscription", value_to_sum: 0 };
                fbq("track", eventName, fbData);
            }

            // Google Analytics
            if (window.gtag) {
                gtag("event", eventName.toLowerCase(), {
                    ...data,
                    event_category: "Ecommerce",
                    value: data.price,
                    items: [
                        { id: data.id, name: data.name, quantity: data.quantity || 1 },
                    ],
                });
            }

            // TikTok Pixel
            if (window.ttq) {
                let ttData = {
                    content_id: data.id,
                    content_type: "product",
                    value: data.price,
                    currency: data.currency || "SAR",
                    quantity: data.quantity,
                };
                if (eventName === "Search") ttData = { query: data.query };
                if (eventName === "CompleteRegistration")
                    ttData = { description: "Subscription" };
                ttq.track(eventName, ttData);
            }

            // Pinterest Tag
            if (window.pintrk) {
                let pinData = {
                    value: data.price,
                    currency: data.currency || "SAR",
                    order_quantity: data.quantity || 1,
                    line_items: [{ product_id: data.id, product_name: data.name }],
                };
                if (eventName === "Search") pinData = { search_query: data.query };
                if (eventName === "CompleteRegistration")
                    pinData = { event_id: "subscription" };
                pintrk("track", eventName, pinData);
            }

            // Snapchat Pixel
            if (window.snaptr) {
                let snapData = {
                    item_ids: [data.id],
                    price: data.price,
                    currency: data.currency || "SAR",
                    number_items: data.quantity || 1,
                };
                if (eventName === "Search") snapData = { description: data.query };
                if (eventName === "CompleteRegistration")
                    snapData = { description: "Subscription" };
                snaptr(
                    "track",
                    eventName.toUpperCase().replace(/([a-z])([A-Z])/g, "$1_$2"),
                    snapData
                );
            }

            // LinkedIn Insight Tag
            if (window.lintrk) {
                if (eventName === "ViewContent" || eventName === "AddToCart") {
                    lintrk("track", { conversion_id: "YOUR_LINKEDIN_CONV_ID" });
                }
            }

            // Twitter Pixel
            if (window.twq) {
                twq("event", "YOUR_TW_EVENT_CODE", {
                    value: data.price,
                    currency: data.currency || "SAR",
                    num_items: data.quantity || 1,
                    content_ids: [data.id],
                    content_name: data.name,
                });
            }

            // Reddit Pixel
            if (window.rdt) {
                let rdData = {
                    itemCount: data.quantity || 1,
                    value: data.price,
                    currency: data.currency || "SAR",
                };
                if (eventName === "Search") rdData = { searchTerm: data.query };
                if (eventName === "CompleteRegistration") eventName = "SignUp";
                rdt("track", eventName, rdData);
            }

            // Quora Pixel
            if (window.qp) {
                let qrData = { revenue: data.price, currency: data.currency || "SAR" };
                qp("track", eventName, qrData);
            }
        } catch (err) {
            console.error("Tracking Error:", err);
        }
    };

    return { trackEvent };
};