# 基數計算（BASE）

[← 統計計算（SD/REG）](14-statistics.md) · [目錄](README.md) · [內置公式 →](16-built-in-formulas.md)

> 原書頁碼：Ch-48–Ch-52。繁體中文；公式、鍵序及辨識不確定處保留原文影像。文字辨識限制見[轉換說明](README.md#轉換說明)。

本節內容：

- [如何進行基數計算（Ch-48）](#ch-48)
- [如何將顯示的計算結果變換為其他數系（Ch-49）](#ch-49)
- [LOGIC 清單的使用（Ch-50）](#ch-50)
- [如何為特定數值指定數系（Ch-50）](#ch-50)
- [如何使用邏輯運算及二進制負值進行計算（Ch-51）](#ch-51)

<a id="ch-48"></a>

## Ch-48

![Ch-48 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-48-0268.png)

要進行在本節中介紹的示範操作時 <img src="assets/excerpts/15-base-n-ch-48-symbol-0825.png" alt="原文符號或待核對字" height="22"> 首先選擇 BASE <img src="assets/excerpts/15-base-n-ch-48-symbol-0826.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-48-symbol-0827.png" alt="原文符號或待核對字" height="22"> 作為計算模式。

### 如何進行基數計算

可如何指定預設 <img src="assets/excerpts/15-base-n-ch-48-symbol-0828.png" alt="原文符號或待核對字" height="22"> 系使用下示 <img src="assets/excerpts/15-base-n-ch-48-symbol-0829.png" alt="原文符號或待核對字" height="22"> 選擇預設數系。

![Ch-48 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-48-0269.png)

<details>
<summary>原書 Ch-48：完整原文影像（本節範圍）</summary>

![原書 Ch-48 本節範圍](assets/pages/15-base-n-ch-48.png)

</details>


<a id="ch-49"></a>

## Ch-49

<img src="assets/excerpts/15-base-n-ch-49-symbol-0830.png" alt="原文符號或待核對字" height="22"> 基數計算範例 <img src="assets/excerpts/15-base-n-ch-49-symbol-0831.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0832.png" alt="原文符號或待核對字" height="22"> 如何選擇一進制作為數系並計算 <img src="assets/excerpts/15-base-n-ch-49-symbol-0833.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0834.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0835.png" alt="原文符號或待核對字" height="22"> 三

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0270.png)

範例 <img src="assets/excerpts/15-base-n-ch-49-symbol-0836.png" alt="原文符號或待核對字" height="22"> 如何選擇八進制作為數系並計算 <img src="assets/excerpts/15-base-n-ch-49-symbol-0837.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0838.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0839.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0840.png" alt="原文符號或待核對字" height="22">

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0271.png)

<img src="assets/excerpts/15-base-n-ch-49-symbol-0841.png" alt="原文符號或待核對字" height="22"> 輸入無效的數值會產生句法錯誤 <img src="assets/excerpts/15-base-n-ch-49-symbol-0842.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0843.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0844.png" alt="原文符號或待核對字" height="22">

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0272.png)

<img src="assets/excerpts/15-base-n-ch-49-symbol-0847.png" alt="原文符號或待核對字" height="22"> 十入進制 <img src="assets/excerpts/15-base-n-ch-49-symbol-0848.png" alt="原文符號或待核對字" height="22"> 值的輸入及計算範例

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0273.png)

範例： 如何選擇十六進制作為數系並計算 <img src="assets/excerpts/15-base-n-ch-49-symbol-0849.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0850.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0851.png" alt="原文符號或待核對字" height="22">

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0274.png)

<img src="assets/excerpts/15-base-n-ch-49-symbol-0852.png" alt="原文符號或待核對字" height="22"> 有效計算範圍

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0275.png)

當計算結果超出當前預設數系的有效範圍時會發生計算錯誤 <img src="assets/excerpts/15-base-n-ch-49-symbol-0853.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0854.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0855.png" alt="原文符號或待核對字" height="22">

### 如何將顯示的計算結果變換為其他數系

當有計算結果顯示時按 <img src="assets/excerpts/15-base-n-ch-49-symbol-0856.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0857.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0858.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0859.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0860.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-49-symbol-0861.png" alt="原文符號或待核對字" height="22"> 或四 <img src="assets/excerpts/15-base-n-ch-49-symbol-0862.png" alt="原文符號或待核對字" height="22"> 該結果將被變換為相

![Ch-49 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-49-0276.png)

<details>
<summary>原書 Ch-49：完整原文影像（本節範圍）</summary>

![原書 Ch-49 本節範圍](assets/pages/15-base-n-ch-49.png)

</details>


<a id="ch-50"></a>

## Ch-50

範例： 如何將十進制數值 <img src="assets/excerpts/15-base-n-ch-50-symbol-0863.png" alt="原文符號或待核對字" height="22"> 變換為二進制、 八進制及十六進制形式

![Ch-50 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-50-0277.png)

### LOGIC 清單的使用

在 BASE 模式中， <img src="assets/excerpts/15-base-n-ch-50-symbol-0864.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-50-symbol-0865.png" alt="原文符號或待核對字" height="22"> 的功能變為 <img src="assets/excerpts/15-base-n-ch-50-symbol-0866.png" alt="原文符號或待核對字" height="22"> 清單的顯示鍵 <img src="assets/excerpts/15-base-n-ch-50-symbol-0867.png" alt="原文符號或待核對字" height="22"> 清單共有三個畫面 <img src="assets/excerpts/15-base-n-ch-50-symbol-0868.png" alt="原文符號或待核對字" height="22"> 用 <img src="assets/excerpts/15-base-n-ch-50-symbol-0869.png" alt="原文符號或待核對字" height="22"> 及 <img src="assets/excerpts/15-base-n-ch-50-symbol-0870.png" alt="原文符號或待核對字" height="22"> 可在其間進行選換。

![Ch-50 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-50-0278.png)

### 如何為特定數值指定數系

輸入數值時， 您可以指定一個與當前預設數系不同的數系。

### 如何在輸入過程中指定茹系

例如， 要輸入一個十進制的數值 3 時， 可使用下示 <img src="assets/excerpts/15-base-n-ch-50-symbol-0873.png" alt="原文符號或待核對字" height="22"> 操作。

![Ch-50 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-50-0279.png)

<details>
<summary>原書 Ch-50：完整原文影像（本節範圍）</summary>

![原書 Ch-50 本節範圍](assets/pages/15-base-n-ch-50.png)

</details>


<a id="ch-51"></a>

## Ch-51

<img src="assets/excerpts/15-base-n-ch-51-symbol-0874.png" alt="原文符號或待核對字" height="22"> 使用基數指定的計算範例範例： 如何進行 <img src="assets/excerpts/15-base-n-ch-51-symbol-0875.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-51-symbol-0876.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-51-symbol-0877.png" alt="原文符號或待核對字" height="22"> 的計算， 並以二進制顯示計算結果

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0280.png)

### 如何使用邏輯運算及二進制負值進行計算

本計算器能進行 10 位 ( 10 位元 ) 的二進制尼 <img src="assets/excerpts/15-base-n-ch-51-symbol-0878.png" alt="原文符號或待核對字" height="22"> 運算及負數計算。 所有下示範例均以 <img src="assets/excerpts/15-base-n-ch-51-symbol-0879.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/15-base-n-ch-51-symbol-0880.png" alt="原文符號或待核對字" height="22">

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0281.png)

返回位積的計算結果。

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0282.png)

返回位和的計算結果。

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0283.png)

返回位異 <img src="assets/excerpts/15-base-n-ch-51-symbol-0881.png" alt="原文符號或待核對字" height="22"> 輯和否的計算結果。

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0284.png)

返回數值的補 <img src="assets/excerpts/15-base-n-ch-51-symbol-0882.png" alt="原文符號或待核對字" height="22"> -

![Ch-51 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-51-0285.png)

<details>
<summary>原書 Ch-51：完整原文影像（本節範圍）</summary>

![原書 Ch-51 本節範圍](assets/pages/15-base-n-ch-51.png)

</details>


<a id="ch-52"></a>

## Ch-52

![Ch-52 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-52-0286.png)

返回數值的 2 的補。

![Ch-52 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/15-base-n-ch-52-0287.png)

<details>
<summary>原書 Ch-52：完整原文影像（本節範圍）</summary>

![原書 Ch-52 本節範圍](assets/pages/15-base-n-ch-52.png)

</details>


[← 統計計算（SD/REG）](14-statistics.md) · [目錄](README.md) · [內置公式 →](16-built-in-formulas.md)
