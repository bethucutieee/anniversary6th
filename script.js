document.addEventListener("DOMContentLoaded", () => {

    const heading = document.querySelector(".letter-heading");
    const letterLines = document.querySelectorAll(".letter-line");

    // Chờ khung thư xuất hiện xong
    const startDelay = 3000;

    // Tiêu đề xuất hiện trước
    setTimeout(() => {
        heading.classList.add("show");
    }, startDelay);

    // Từng dòng thư xuất hiện lần lượt
    letterLines.forEach((line, index) => {

        setTimeout(() => {
            line.classList.add("show");
        }, startDelay + 1100 + index * 1300);

    });

});