function promisePool(functions, n) {
  const eval = () => functions[n++]?.().then(eval);

  return Promise.all(functions.slice(0, n).map((fn) => fn().then(eval)));
}

const urls = [
  "https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg",
  "https://www.kkkk1000.com/images/getImgData/gray.gif",
  "https://www.kkkk1000.com/images/getImgData/Particle.gif",
  "https://www.kkkk1000.com/images/getImgData/arithmetic.png",
  "https://www.kkkk1000.com/images/getImgData/arithmetic2.gif",
  "https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg",
  "https://www.kkkk1000.com/images/getImgData/arithmetic.gif",
  "https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/10/29/166be40ccc434be0~tplv-t2oaga2asx-image.image",
];

function loadImg(url) {
  return new Promise((resolve, reject) => {
    console.log("图片加载", url);
    const img = new Image();
    img.onload = function () {
      console.log("一张图片加载完成", url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
}

promisePool(
  urls.map((url) => () => loadImg(url)),
  3
);
