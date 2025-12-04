export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",  // 이 파일이 여기 포함되나요?
    ],
    theme: {
        extend: {
            screens: {
                xs: "440px",   // <= 커스텀 브레이크포인트
            },
        },

    },
};