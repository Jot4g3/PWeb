function capitalize(str) {
    var strCapitilized = "";
    var wordList = str.split(" "); // Separando as palavras, de espaço (" ") em espaço e colocando-as numa lista.

    for (const word of wordList) {
        strCapitilized = strCapitilized + ` ${word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}`
    }

    return strCapitilized;
}

module.exports = { capitalize }; // Exportando a função.