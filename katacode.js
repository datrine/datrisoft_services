// Feel free to write and use any additional functions, variables, objects, etc. as you wish

/* String, Int ->  Int */
function countPatternsFrom(firstDot, length) {

    let totalMoves = []
    let allMoves = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    let moveA = ["B", "C", "D", "E", "F", "G", "H", "I"];
    let moveB = ["A", "C", "D", "E", "F", "G", "H", "I"];
    let moveC = ["A", "B", "D", "E", "F", "G", "H", "I"];
    let moveD = ["A", "B", "C", "E", "F", "G", "H", "I"];
    let moveE = ["A", "B", "C", "D", "F", "G", "H", "I"];
    let moveF = ["A", "B", "C", "D", "E", "G", "H", "I"];
    let moveG = ["A", "B", "C", "D", "E", "F", "H", "I"];
    let moveH = ["A", "B", "C", "D", "E", "F", "G", "I"];
    let moveI = ["A", "B", "C", "D", "E", "F", "G", "H"];
    function move(btn, arr = []) {
        if (arr.length === length) {
            totalMoves.push(arr)
            return arr
        }
        if (arr.indexOf(btn) !== -1) {
            //return;
        }
        // arr.push(btn)
        switch (btn) {
            case "A":
                moveA.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "I" && arr.indexOf("E") === -1) || (elem === "G" && arr.indexOf("D") === -1)
                        || (elem === "C" && arr.indexOf("B") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "B":
                moveB.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "H" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "C":
                moveC.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "I" && arr.indexOf("F") === -1) ||
                        (elem === "G" && arr.indexOf("E") === -1) ||
                        (elem === "A" && arr.indexOf("B") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "D":
                moveD.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "F" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "E":
                moveE.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "F":
                moveF.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "D" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "G":
                moveG.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "C" && arr.indexOf("E") === -1) ||
                        (elem === "A" && arr.indexOf("D") === -1) || (elem === "I" && arr.indexOf("H") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "H":
                moveH.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "B" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "I":
                moveI.forEach(elem => {
                    if (arr.indexOf(elem) !== -1) {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "A" && arr.indexOf("E") === -1) ||
                        (elem === "G" && arr.indexOf("H") === -1) || (elem === "C" && arr.indexOf("F") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            default:
                break;
        }
    }
    move(firstDot, [firstDot])
    return totalMoves.length
}


console.time("countPatternsFrom")
console.log(countPatternsFrom("E", 4))
console.timeEnd("countPatternsFrom")


/* String, Int ->  Int */
function altCountPatternsFrom(firstDot, length) {
    let totalMoves = []
    let allMoves = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    function move(btn, arr = []) {
        if (arr.length === length) {
            totalMoves.push(arr)
            return arr
        }
        switch (btn) {
            case "A":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "A") {
                        return;
                    }
                    if ((elem === "I" && arr.indexOf("E") === -1) || (elem === "G" && arr.indexOf("D") === -1)
                        || (elem === "C" && arr.indexOf("B") === -1)) {
                        return;
                    }
                    let temparr = [...arr]
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "B":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "B") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "H" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "C":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "C") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "I" && arr.indexOf("F") === -1) ||
                        (elem === "G" && arr.indexOf("E") === -1) ||
                        (elem === "A" && arr.indexOf("B") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;

            case "D":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "D") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "F" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "E":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "E") {
                        return;
                    }
                    let temparr = [...arr]
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "F":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "F") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "D" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "G":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "G") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "C" && arr.indexOf("E") === -1) ||
                        (elem === "A" && arr.indexOf("D") === -1) || (elem === "I" && arr.indexOf("H") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "H":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "H") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "B" && arr.indexOf("E") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            case "I":
                allMoves.forEach(elem => {
                    if (arr.indexOf(elem) !== -1 || elem === "I") {
                        return;
                    }
                    let temparr = [...arr]
                    if ((elem === "A" && arr.indexOf("E") === -1) ||
                        (elem === "G" && arr.indexOf("H") === -1) || (elem === "C" && arr.indexOf("F") === -1)) {
                        return;
                    }
                    temparr.push(elem)
                    move(elem, temparr)
                });
                break;
            default:
                break;
        }
    }
    move(firstDot, [firstDot])
    return totalMoves.length
}

console.time("altCountPatternsFrom")
console.log(altCountPatternsFrom("E", 4))
console.timeEnd("altCountPatternsFrom")

function encodeRailFenceCipher(string, numberRails) {
    // code
    let arr = string.split("");
    let tempArr = []
    let filter = (offset, numRails, dir) => (elem) => {
        let arr = tempArr[offset] = tempArr[offset] || []
        arr.push(elem)
        if (offset === 0) {
            dir = true;
        }
        else if (offset === numRails - 1) {
            dir = false;
        }
        if (dir) {
            offset++;
        }
        else {
            offset--;
        }
    }
    let filterPre = filter(0, numberRails)
    arr.forEach(filterPre)

    console.log(tempArr)
    return tempArr.map(subArr => subArr.join("")).join("");
}
console.log(encodeRailFenceCipher("Hello, World!", 3))


function decodeRailFenceCipher(string, numberRails) {
    let superArr = string.split("") || [];
    console.log(string)
    let length = superArr.length;
    let tempArr = []
    let index = 0;
    let filter = (offset, dir = true) => (letter) => {
        if (offset === numberRails-1) {
            dir = false
        }
        else if (offset===0) {
            dir = true
        }
        tempArr[offset]=tempArr[offset]||[]
        tempArr[offset].push(letter)
        if (dir === true) {
            ++offset
        }
        else {
            --offset;
        }
    }
    let preFilter = filter(0)
    superArr.forEach(preFilter)
    console.log(tempArr);

}

console.log(decodeRailFenceCipher(encodeRailFenceCipher("ABCDEFGHIJKLMN", 3), 3))
