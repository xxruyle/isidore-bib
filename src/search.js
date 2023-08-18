
const SearchManager = () => {
    const bible = require('./EntireBible-DR.json')


    // Uses regex to parse user input and make an object that has book, chapter, initial verse, and endverse 
    const parseInput = (passage) => {
        const bibleRe = /^(\d?\s?[A-Za-z]+)?\s*(\d+)(?:\s*:\s*(\d+))?(?:-(\d+))?/;



        const rePassage = bibleRe.exec(passage.trim());

        console.log(rePassage);

        if (rePassage != null)
        {
            let bookName = rePassage[1].replace(/(\d)([A-Za-z])/, '$1$2');

            bookName = bookName.replace(/\b\w/g, char => char.toUpperCase());

            let endVerse; 

            rePassage[4] !== undefined ? endVerse = rePassage[4] : endVerse = undefined; 


            if (endVerse !== null && Number(endVerse) < Number(rePassage[3])) { 
                return {book: null, chapter: null, initialverse: null, endverse: null} 
            }

            let passageObj = {
                book: bookName,
                chapter: rePassage[2],
                initialverse: rePassage[3],
                endverse: endVerse,
                input: rePassage.input 
            }
    
            return passageObj
        } else {
            return {book: null, chapter: null, initialverse: null, endverse: null}
        }
    }


    // Handles the DOM task of adding a header to .passage-header
    const createHeader = (passageObject) => {
        const passageHeaderNode = document.querySelector('.passage-header')

        passageHeaderNode.textContent = ""

        let headerText = "Not Found" 

        if (passageObject.endverse === undefined) { 
            headerText = `${passageObject.book} ${passageObject.chapter}:${passageObject.initialverse}` 
        } else {
            headerText = `${passageObject.book} ${passageObject.chapter}:${passageObject.initialverse}-${passageObject.endverse}`
        }

        headerText = headerText.replace('undefined', '')


        if (passageObject.initialverse === undefined) {
            headerText = headerText.replace(':', '')
        }

        passageHeaderNode.textContent = headerText
    }

    const createXMLid = (passageObject, initialverse) => {
        let bookName = passageObject.book.replace(/\s+/g, '') // squish together book names if there is a space EX: 1 Peter -> 1Peter

        let xmlid = `Bible:${bookName}.${passageObject.chapter}.${initialverse}`

        return xmlid
    }

    const createTomlName = (passageObject, initialverse) => {
        const noBookSpace = removeWhitespace(passageObject.book); 
        let tomlName = `${noBookSpace}_${passageObject.chapter}_${initialverse}.toml`;
        return tomlName;
    }

    const createTomlFileString = (tomlname) => {
        const numberSpace = tomlname.replace(/(\d)(?=[a-zA-Z])/g, '$1 '); // replaces 1John 1_1 to be 1 John 1_1 

        return numberSpace.replace(/_/, ' ') // replaces first underscore with a space 
    }


    const convertTomlFileString = (tomlFileString) => { // converts EX: John 1_1 -> John 1:1 

    }

    const removeWhitespace = (bookName) => {
        return bookName.replace(/\s+/g, '');
    }



    // Handles the DOM related task of adding the correct verses to the .verse-container 
    const createVerses = (passageObject) => {

        const bibleTextNode = document.querySelector('.verse-container')
        bibleTextNode.innerHTML = ""; 
        const bookNoSpace = removeWhitespace(passageObject.book)
        console.log(bookNoSpace)

        if (passageObject.initialverse === undefined) { // example Job 2 
            let chapterLength = Object.keys(bible[passageObject.book][passageObject.chapter]).length
            for (let i = 1; i <= chapterLength; i++) {
                const pNode = document.createElement('p');
                pNode.id = 'verse'

                pNode.classList.add(bookNoSpace)

                let toml = createTomlName(passageObject, i)
                pNode.classList.add(toml)



                pNode.innerHTML = `<sup class="verse-superscript">${i}</sup> ${bible[passageObject.book][passageObject.chapter][i]}`

                bibleTextNode.appendChild(pNode);
            }


        } else if (passageObject.endverse !== undefined) { // example: Job 2:3-4
            for (let i = Number(passageObject.initialverse); i <= Number(passageObject.endverse); i++) {    
                if (bible[passageObject.book][passageObject.chapter][i] !== undefined) {

                    const pNode = document.createElement('p')
                    pNode.id = 'verse'

                    pNode.classList.add(bookNoSpace);

                    let toml = createTomlName(passageObject, i)
                    pNode.classList.add(toml)

                    pNode.innerHTML = `<sup class="verse-superscript">${i}</sup>  ${bible[passageObject.book][passageObject.chapter][i]}`

                    bibleTextNode.appendChild(pNode);

                }
            }
        } else { // example: Job 2:2
            const pNode = document.createElement('p');
            pNode.id = 'verse'
            pNode.classList.add(bookNoSpace)

            let toml = createTomlName(passageObject, passageObject.initialverse)
            pNode.classList.add(toml)


            pNode.innerHTML = `<sup class="verse-superscript">${passageObject.initialverse}</sup> ${bible[passageObject.book][passageObject.chapter][passageObject.initialverse]}` 
            bibleTextNode.appendChild(pNode);

        }
    }

    const initCommentary = (passage) => {
        const commentaryContainer = document.querySelector('.commentary-container') 

        commentaryContainer.innerHTML = " " 

        const sideContainer = document.querySelector('.side-commentary')


        if (Array.from(sideContainer.classList).includes('hidden')){      
            sideContainer.classList.remove('hidden') 
        }



        const commentaryTitle = document.createElement('div')
        commentaryTitle.classList.add('commentary-title')

        commentaryTitle.textContent = `Commentary for ${passage}`

        console.log(commentaryContainer)

        sideContainer.insertBefore(commentaryTitle, commentaryContainer)



    }

    const createCommentaryCards = (father_name, quote) => {

        const commentaryContainer = document.querySelector('.commentary-container') 





        const commentaryCard = document.createElement('div')
        commentaryCard.classList.add('commentary-card')

        const commentaryFather = document.createElement('div')
        commentaryFather.classList.add('commentary-father')
        commentaryFather.textContent = father_name 


        const commentaryText = document.createElement('div')
        commentaryText.classList.add('commentary-text')
        commentaryText.classList.add('overflow-auto')
        commentaryText.textContent = quote 

        const expandIcon = document.createElement('span')
        expandIcon.classList.add('expand-icon')
        expandIcon.classList.add('material-symbols-outlined')
        expandIcon.textContent = "expand_more" 

        commentaryCard.appendChild(commentaryFather)
        commentaryCard.appendChild(commentaryText)
        commentaryCard.appendChild(expandIcon)

        commentaryContainer.appendChild(commentaryCard)
    }

    // Handles the DOM task of adding the correct header and verse to the .passage-container
    const getBiblePassage = (passageObject) => {
        console.log(passageObject)
        if (passageObject.book !== null) {
            createHeader(passageObject);
            createVerses(passageObject)   
        } 
    }

    const getCommentary = (bookName, tomlString) => {
        const comments = require(`../dist/commentary/${bookName}.json`)
        const whiteSpaceToml = createTomlFileString(tomlString)

        const passages = comments.filter((comment) => comment.file_name === whiteSpaceToml)

        initCommentary(whiteSpaceToml)


        passages.forEach((quote) => {
            // console.log(quote.father_name, quote.txt)
            createCommentaryCards(quote.father_name, quote.txt)
        })

    }

    const getCommentaryInput = () => {

        document.body.addEventListener('change', () => {
            let verses = document.querySelectorAll('p'); 

            verses.forEach((verse) => {
                verse.addEventListener('click', (event) => {
                    console.log(event.target.classList)
                    getCommentary(event.target.classList[0], event.target.classList[1])
                })
            })
        })


    }

    // obtains user input and calls getBiblePassage() after user input is parsed by parseInput()
    const getInput = () => {
        const searchText = document.querySelector('.search-text')

        const searchConfirm = document.querySelector('.search-confirm')

        searchConfirm.addEventListener('click', () => {
            let parsedInput = parseInput(searchText.value)
            getBiblePassage(parsedInput)
        })

        window.addEventListener('keydown', (event) => {
            if (event.key === "Enter") {
                let parsedInput = parseInput(searchText.value)
                getBiblePassage(parsedInput)
            }
        })
    }


    return {getInput, getCommentaryInput, getCommentary}
}


export {
    SearchManager
}