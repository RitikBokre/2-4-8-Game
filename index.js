const mainEl = document.querySelector(".main-container");
const overEl = document.querySelector(".over-txt");
const resetBtn = document.querySelector(".reset-btn");
const scoreEl = document.querySelector(".current-score");
const maxScoreEl = document.querySelector(".highest-score");
let score = 0;
var intialPos = {};
var finalPos = {};
var gameOver = false;

const initialArray = [
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

const initialEmptyStack = [
  "00",
  "01",
  "02",
  "03",
  "10",
  "11",
  "12",
  "13",
  "20",
  "21",
  "22",
  "23",
  "30",
  "31",
  "32",
  "33",
];

let array = JSON.parse(JSON.stringify(initialArray));

let emptyStack = [...initialEmptyStack];

const dist = 30;
maxScoreEl.textContent = localStorage.getItem("highScore") || 0;
let maxScore = maxScoreEl.textContent;

function swipeUpdateArrayUi() {
  const pushTwo = updatedEmptyStack();
  renderItems();
  if (pushTwo) {
    setTimeout(randomIndexPushArray, 150);
  }
  scoreEl.textContent = score;
  if (score > maxScore) {
    maxScore = score;
    maxScoreEl.textContent = score;
  }
}

function startSwipe(e, isDesktop) {
  if (gameOver) {
    return;
  }
  intialPos.ix = isDesktop ? e.x : e.touches[0].clientX;
  intialPos.iy = isDesktop ? e.y : e.touches[0].clientY;
}

function setFinalPos(e, isDesktop) {
  if (gameOver) {
    return;
  }
  finalPos.fx = isDesktop ? e.x : e.touches[0].clientX;
  finalPos.fy = isDesktop ? e.y : e.touches[0].clientY;
}

function endSwipe() {
  if (gameOver) {
    return;
  }

  if (
    Math.abs(intialPos.ix - finalPos.fx) > Math.abs(intialPos.iy - finalPos.fy)
  ) {
    if (intialPos.ix > finalPos.fx) {
      xSwipe(true);
    } else {
      xSwipe(false);
    }
  } else {
    if (intialPos.iy > finalPos.fy) {
      ySwipe(true);
    } else {
      if (intialPos.iy === finalPos.fy) {
        return;
      }
      ySwipe(false);
    }
  }
  swipeUpdateArrayUi();
}

mainEl.addEventListener("mousedown", (e) => {
  startSwipe(e, true);
});

mainEl.addEventListener("mouseup", (e) => {
  setFinalPos(e, true);
  endSwipe();
});

mainEl.addEventListener("touchstart", (e) => {
  startSwipe(e, false);
});

mainEl.addEventListener("touchmove", (e) => {
  setFinalPos(e, false);
});

mainEl.addEventListener("touchend", (e) => {
  endSwipe();
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowUp":
      ySwipe(true);
      break;
    case "ArrowDown":
      ySwipe(false);
      break;
    case "ArrowRight":
      xSwipe(false);
      break;
    case "ArrowLeft":
      xSwipe(true);
      break;
  }
  swipeUpdateArrayUi();
});

function clearSpace({ item, hasPush }) {
  let itemArray = [];
  let count = 0;
  for (let i = 0; i < item.length; i++) {
    if (item[i] === "") {
      count++;
    } else {
      itemArray.push(item[i]);
    }
  }

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      hasPush ? itemArray.push("") : itemArray.unshift("");
    }
  }
  return itemArray;
}

function editArray(item, leftFlow) {
  if (leftFlow) {
    for (let i = 0; i < item.length; i++) {
      if (item[i + 1] === "") {
        break;
      }
      if (item[i + 1] === item[i]) {
        item[i] = item[i] * 2;
        score += item[i];
        item[i + 1] = "";
        i++;
      }
    }
  } else {
    for (let i = item.length - 1; i > 0; i--) {
      if (item[i - 1] === "") {
        break;
      }
      if (item[i - 1] === item[i]) {
        item[i] = item[i] * 2;
        score += item[i];
        item[i - 1] = "";
        i--;
      }
    }
  }
}

function xSwipe(isLeft) {
  array.forEach((item) => {
    let newItem = clearSpace({ item, hasPush: isLeft });
    for (let i = 0; i < newItem.length; i++) {
      item[i] = newItem[i];
    }

    editArray(item, isLeft);

    newItem = clearSpace({ item, hasPush: isLeft });
    for (let i = 0; i < newItem.length; i++) {
      item[i] = newItem[i];
    }
  });
}

function ySwipe(isUp) {
  array.forEach((item, xIdx) => {
    let verticalArray = [];
    item.forEach((mini, yIdx) => {
      verticalArray[yIdx] = array[yIdx][xIdx];
    });

    verticalArray = clearSpace({ item: verticalArray, hasPush: isUp });
    editArray(verticalArray, isUp);

    verticalArray = clearSpace({ item: verticalArray, hasPush: isUp });
    item.forEach((mini, yIdx) => {
      array[yIdx][xIdx] = verticalArray[yIdx];
    });
  });
}

function getContentBasedClass(content) {
  switch (content) {
    case 2:
      return "two";
    case 4:
      return "four";
    case 8:
      return "eight";
    case 16:
      return "sixteen";
    case 32:
      return "thirtytwo";
    case 64:
      return "sixtyfour";
    case 128:
      return "onehundredtwentytwo";
    case 256:
      return "twohundredfiftysix";
    case 512:
      return "fivehundredtweleve";
    default:
      return "";
  }
}

function renderItems() {
  let htmlStr = "";
  array.forEach((item) => {
    item.forEach((content) => {
      htmlStr += `<div class="item ${getContentBasedClass(
        content
      )}">${content}</div>`;
    });
  });
  mainEl.innerHTML = htmlStr;
}

function removeItem(value) {
  const index = emptyStack.indexOf(value);
  if (index > -1) {
    emptyStack.splice(index, 1);
  }
}

function randomIndexPushArray() {
  const length = emptyStack.length;
  if (length === 0) {
    gameOver = true;
    overEl.classList.remove("hide");
    resetBtn.textContent = "New Game";
    if (score === maxScore) {
      alert("Congratulations you have Set a new high Score");
      localStorage.setItem("highScore", maxScore);
    }
    return;
  }
  const randomIdx = Math.floor(Math.random() * length);
  const proccesedIdxStr = emptyStack[randomIdx];
  removeItem(proccesedIdxStr);
  xIdx = Number(proccesedIdxStr[0]);
  yIdx = Number(proccesedIdxStr[1]);
  array[xIdx][yIdx] = 2;
  renderItems();
}

function updatedEmptyStack() {
  const checkArray = [...emptyStack];
  emptyStack = [];
  array.forEach((item, xIdx) => {
    item.forEach((citem, yIdx) => {
      if (citem === "") {
        emptyStack.push(`${xIdx}${yIdx}`);
      }
    });
  });

  const pushTwo = !checkArray.every(
    (item, index) => item === emptyStack[index]
  );

  return pushTwo;
}

resetBtn.addEventListener("click", reset);

function reset() {
  if (score === maxScore) {
    alert("Congratulations you have Set a new high Score");
    localStorage.setItem("highScore", maxScore);
  }
  array = JSON.parse(JSON.stringify(initialArray));
  emptyStack = JSON.parse(JSON.stringify(initialEmptyStack));
  scoreEl.textContent = "0";
  maxScoreEl.textContent = maxScore;
  score = 0;
  overEl.classList.add("hide");
  resetBtn.textContent = "Reset Game";
  randomIndexPushArray(); // first 2 via initial start
  renderItems();
}

randomIndexPushArray(); // first 2 via initial start
randomIndexPushArray(); // first 2 via initial start
