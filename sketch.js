let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖

let char2StopSprite; // 儲存角色二的站立/待機精靈圖（2/stop/stop.png）
let char2ActionSprite; // 儲存角色二的動作精靈圖（2/action/action.png）

let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

// 五題不同的中文字與注音選擇題題庫
const zhuyinQuizList = [
  {
    char: "海",
    prompt: "請選出「海」的正確注音：",
    options: [
      { label: "1", bopomofo: ["ㄏ", "ㄞ", "ˇ"] },
      { label: "2", bopomofo: ["ㄏ", "ㄟ", "ˇ"] },
      { label: "3", bopomofo: ["ㄇ", "ㄞ", "ˇ"] }
    ],
    answerIndex: 0
  },
  {
    char: "風",
    prompt: "請選出「風」的正確注音：",
    options: [
      { label: "1", bopomofo: ["ㄈ", "ㄣ"] },
      { label: "2", bopomofo: ["ㄈ", "ㄥ"] },
      { label: "3", bopomofo: ["ㄏ", "ㄥ"] }
    ],
    answerIndex: 1
  },
  {
    char: "雲",
    prompt: "請選出「雲」的正確注音：",
    options: [
      { label: "1", bopomofo: ["ㄩ", "ㄣ", "ˋ"] },
      { label: "2", bopomofo: ["ㄧ", "ㄣ", "ˊ"] },
      { label: "3", bopomofo: ["ㄩ", "ㄣ", "ˊ"] }
    ],
    answerIndex: 2
  },
  {
    char: "星",
    prompt: "請選出「星」的正確注音：",
    options: [
      { label: "1", bopomofo: ["ㄒ", "ㄧ", "ㄥ"] },
      { label: "2", bopomofo: ["ㄒ", "ㄧ", "ㄣ"] },
      { label: "3", bopomofo: ["ㄑ", "ㄧ", "ㄥ"] }
    ],
    answerIndex: 0
  },
  {
    char: "橋",
    prompt: "請選出「橋」的正確注音：",
    options: [
      { label: "1", bopomofo: ["ㄐ", "ㄧ", "ㄠ", "ˊ"] },
      { label: "2", bopomofo: ["ㄑ", "ㄧ", "ㄠ", "ˊ"] },
      { label: "3", bopomofo: ["ㄑ", "ㄧ", "ㄠ", "ˇ"] }
    ],
    answerIndex: 1
  }
];

let currentQuizIndex = 0; // 目前顯示的題目索引
let selectedAnswerIndex = null; // 記錄玩家選擇的選項索引
let wasNearChar2 = false; // 記錄上一幀角色一是否處於角色二附近
let hasAnsweredThisEncounter = false; // 記錄本次靠近是否已完成作答
let closeBoxAtMillis = null; // 記錄作答後預計關閉方框的時間戳記
let optionHitBoxes = []; // 儲存各選項在畫布上的點擊區域

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 角色二精靈圖參數設定
const char2StopFrameCount = 8; // 2/stop/stop.png 共有 8 張影格
const char2StopSpriteWidth = 699; // 2/stop/stop.png 全寬
const char2StopFrameWidth = char2StopSpriteWidth / char2StopFrameCount; // 每格寬度
const char2StopFrameHeight = 190; // 2/stop/stop.png 高度

const char2ActionFrameCount = 12; // 2/action/action.png 共有 12 張影格
const char2ActionSpriteWidth = 1627; // 2/action/action.png 全寬
const char2ActionFrameWidth = char2ActionSpriteWidth / char2ActionFrameCount; // 每格寬度
const char2ActionFrameHeight = 171; // 2/action/action.png 高度

function pickRandomQuiz() {
  if (zhuyinQuizList.length <= 1) {
    currentQuizIndex = 0;
  } else {
    let nextIdx = floor(random(zhuyinQuizList.length));
    while (nextIdx === currentQuizIndex) {
      nextIdx = floor(random(zhuyinQuizList.length));
    }
    currentQuizIndex = nextIdx;
  }
  selectedAnswerIndex = null;
  closeBoxAtMillis = null;
  hasAnsweredThisEncounter = false;
}

function submitQuizAnswer(index) {
  if (selectedAnswerIndex !== null || hasAnsweredThisEncounter) return;
  selectedAnswerIndex = index;
  hasAnsweredThisEncounter = true;
  closeBoxAtMillis = millis() + 650; // 短暫顯示答對/答錯回饋後關閉方框
}

function preload() { // 在畫布建立前載入圖片資源
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖

  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的站立精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的動作精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格的中心點
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處
  currentQuizIndex = floor(random(zhuyinQuizList.length));
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色避免圖片載入前空白

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = 1; // 設定角色朝向右方
    if (characterX < anchorX) {
      // 若角色先前因碰到最左邊界而往左移動，先讓角色走回基準點再捲動背景
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      // 背景尚未到達最右邊，背景往左移動
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      // 背景已到達最右邊，暫停背景捲動並改為角色向右移動
      characterX += movementStep; // 讓角色向右移動
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = -1; // 設定角色朝向左方
    if (characterX > anchorX) {
      // 若角色先前因碰到最右邊界而往右移動，先讓角色走回基準點再捲動背景
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      // 背景尚未到達最左邊，背景往右移動
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      // 背景已到達最左邊，暫停背景捲動並改為角色向左移動
      characterX -= movementStep; // 讓角色向左移動
    }
  }

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左：i = -1，中：i = 0，右：i = 1）
  if (bgImage) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // 計算角色二位置：位於最左邊背景圖（i = -1）的水平中心，並隨背景捲動
  const leftmostBgLeftX = bgOffsetX - singleBgWidth;
  const char2X = leftmostBgLeftX + singleBgWidth / 2;

  // 角色二等比例縮放（與角色一相同高度基準，避免畫面比例失衡）
  const char2Scale = (height / 3) / char2StopFrameHeight;

  // 判斷角色一是否接近角色二
  const char2BaseWidth = char2StopFrameWidth * char2Scale;
  const proximityThreshold = (characterWidth + char2BaseWidth) * 0.5 + max(40, width * 0.04);
  const isChar1NearChar2 = abs(characterX - char2X) <= proximityThreshold;

  // 遠離角色二後重置本次靠近狀態，等再次靠近時隨機抽新題目並顯示方框
  if (!isChar1NearChar2 && wasNearChar2) {
    hasAnsweredThisEncounter = false;
    selectedAnswerIndex = null;
    closeBoxAtMillis = null;
  } else if (isChar1NearChar2 && !wasNearChar2 && !hasAnsweredThisEncounter) {
    pickRandomQuiz();
  }
  wasNearChar2 = isChar1NearChar2;

  // 依接近與否選擇角色二精靈圖與影格參數
  const char2ActiveSprite = isChar1NearChar2 ? char2ActionSprite : char2StopSprite;
  const char2ActiveFrameCount = isChar1NearChar2 ? char2ActionFrameCount : char2StopFrameCount;
  const char2ActiveFrameWidth = isChar1NearChar2 ? char2ActionFrameWidth : char2StopFrameWidth;
  const char2ActiveFrameHeight = isChar1NearChar2 ? char2ActionFrameHeight : char2StopFrameHeight;

  const char2FrameIndex = floor(frameCount / framesPerStep) % char2ActiveFrameCount;
  const char2SourceX = char2FrameIndex * char2ActiveFrameWidth;
  const char2DisplayWidth = char2ActiveFrameWidth * char2Scale;
  const char2DisplayHeight = char2ActiveFrameHeight * char2Scale;
  const char2Y = height - char2DisplayHeight / 2;
  const char2Facing = characterX >= char2X ? 1 : -1;

  // 繪製角色二（位於角色一左側背景中心）
  if (char2ActiveSprite) {
    push();
    translate(char2X, char2Y);
    scale(isChar1NearChar2 ? char2Facing : 1, 1);
    image(
      char2ActiveSprite,
      0,
      0,
      char2DisplayWidth,
      char2DisplayHeight,
      char2SourceX,
      0,
      char2ActiveFrameWidth,
      char2ActiveFrameHeight
    );
    pop();
  }

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次
    isCasting = false; // 結束施法動畫並恢復一般角色動作
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效
  } // 結束施法動畫完成判斷

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部

  push(); // 暫存目前的繪圖座標轉換狀態
  translate(characterX, characterY); // 將繪圖原點移至角色中心
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格
  pop(); // 還原繪圖座標轉換狀態

  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效
      continue; // 略過已移除特效的繪製
    } // 結束特效邊界判斷
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格
    push(); // 暫存目前的繪圖座標轉換狀態
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格
    pop(); // 還原繪圖座標轉換狀態
  } // 結束飛行中特效更新迴圈

  // 判斷是否應顯示題目方框：靠近角色二、尚未完成作答（或仍在短暫回饋倒數內）
  const isBoxStillInGracePeriod = closeBoxAtMillis !== null && millis() < closeBoxAtMillis;
  const shouldShowQuizBox = isChar1NearChar2 && (!hasAnsweredThisEncounter || isBoxStillInGracePeriod);

  if (shouldShowQuizBox) {
    drawZhuyinQuizBox();
  } else {
    optionHitBoxes = [];
  }
} // 結束繪圖函式

function drawZhuyinQuizBox() {
  optionHitBoxes = [];

  const currentQuiz = zhuyinQuizList[currentQuizIndex];

  const boxWidth = width / 3;
  const boxHeight = height / 2;
  const boxX = (width - boxWidth) / 2; // 水平置中
  const boxY = max(16, height * 0.04); // 靠近畫布上方

  push();
  // 繪製透明度為 90 的白色方框
  fill(255, 255, 255, 90);
  stroke(255, 255, 255, 180);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 14);

  const centerX = boxX + boxWidth / 2;
  noStroke();
  fill(20, 30, 45);
  textAlign(CENTER, CENTER);

  // 題目說明
  const promptSize = constrain(min(boxWidth * 0.052, boxHeight * 0.085), 14, 22);
  textSize(promptSize);
  text(currentQuiz.prompt, centerX, boxY + boxHeight * 0.14);

  // 中央目標中文字
  const targetCharSize = constrain(min(boxWidth * 0.15, boxHeight * 0.21), 28, 60);
  textSize(targetCharSize);
  textStyle(BOLD);
  text(currentQuiz.char, centerX, boxY + boxHeight * 0.33);
  textStyle(NORMAL);

  // 三個注音選項（水平排列，每個選項內注音直式排列）
  const optCount = currentQuiz.options.length;
  const optAreaTop = boxY + boxHeight * 0.48;
  const optAreaHeight = boxHeight * 0.34;
  const optWidth = min((boxWidth - 36) / optCount - 8, boxWidth * 0.25);
  const optGap = 10;
  const totalOptsWidth = optCount * optWidth + (optCount - 1) * optGap;
  const startX = centerX - totalOptsWidth / 2;

  const bopomofoSize = constrain(min(optWidth * 0.32, optAreaHeight * 0.21), 12, 20);

  for (let i = 0; i < optCount; i++) {
    const opt = currentQuiz.options[i];
    const ox = startX + i * (optWidth + optGap);
    const oy = optAreaTop;

    optionHitBoxes.push({
      index: i,
      x: ox,
      y: oy,
      w: optWidth,
      h: optAreaHeight
    });

    // 選項底色與作答回饋
    if (selectedAnswerIndex === i) {
      if (i === currentQuiz.answerIndex) {
        fill(140, 235, 165, 215);
      } else {
        fill(245, 150, 150, 215);
      }
    } else {
      fill(255, 255, 255, 195);
    }
    stroke(60, 75, 95, 160);
    strokeWeight(1.5);
    rect(ox, oy, optWidth, optAreaHeight, 10);

    // 選項編號（1 / 2 / 3）
    noStroke();
    fill(30, 40, 55);
    textSize(constrain(bopomofoSize * 0.75, 11, 15));
    text(opt.label, ox + optWidth / 2, oy + 12);

    // 直式注音符號
    textSize(bopomofoSize);
    const lineStep = bopomofoSize * 1.06;
    const totalBopoHeight = opt.bopomofo.length * lineStep;
    const bopoStartY = oy + optAreaHeight * 0.56 - totalBopoHeight / 2 + lineStep / 2;
    for (let j = 0; j < opt.bopomofo.length; j++) {
      text(opt.bopomofo[j], ox + optWidth / 2, bopoStartY + j * lineStep);
    }
  }

  // 作答結果提示
  if (selectedAnswerIndex !== null) {
    const isCorrect = selectedAnswerIndex === currentQuiz.answerIndex;
    fill(isCorrect ? color(15, 110, 45) : color(175, 30, 30));
    textSize(constrain(promptSize * 0.85, 13, 19));
    text(isCorrect ? "答對了！" : "答錯了！", centerX, boxY + boxHeight * 0.91);
  }

  pop();
}

function mousePressed() {
  if (optionHitBoxes.length === 0) return;

  for (const box of optionHitBoxes) {
    if (
      mouseX >= box.x &&
      mouseX <= box.x + box.w &&
      mouseY >= box.y &&
      mouseY <= box.y + box.h
    ) {
      submitQuizAnswer(box.index);
      break;
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向
  if (optionHitBoxes.length > 0 && selectedAnswerIndex === null) {
    if (key === "1") {
      submitQuizAnswer(0);
      return false;
    }
    if (key === "2") {
      submitQuizAnswer(1);
      return false;
    }
    if (key === "3") {
      submitQuizAnswer(2);
      return false;
    }
  }

  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = 1; // 讓角色面向右方
    return false; // 防止方向鍵捲動網頁
  } // 結束右方向鍵判斷
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = -1; // 讓角色面向左方
    return false; // 防止方向鍵捲動網頁
  } // 結束左方向鍵判斷
  if (keyCode === 32) { // 判斷是否按下空白鍵
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發
      isCasting = true; // 開始播放施法動畫
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面
      magicDirection = facingDirection; // 鎖定施法當下角色面向
    } // 結束施法啟動判斷
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發
    return false; // 防止空白鍵捲動網頁
  } // 結束空白鍵判斷
} // 結束按鍵事件處理函式

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態
  if (keyCode === 32) { // 判斷放開的是否為空白鍵
    spaceIsDown = false; // 允許下次按空白鍵重新施法
  } // 結束空白鍵放開判斷
} // 結束按鍵放開事件處理函式

function windowResized() { // 視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內
} // 結束視窗縮放處理函式