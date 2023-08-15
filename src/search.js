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
        let bookName = passageObject.book.replace(/\s/g, '') // squish together book names if there is a space EX: 1 Peter -> 1Peter

        let xmlid = `Bible:${bookName}.${passageObject.chapter}.${initialverse}`

        return xmlid
    }



    // Handles the DOM related task of adding the correct verses to the .verse-container 
    const createVerses = (passageObject) => {

        const bibleTextNode = document.querySelector('.verse-container')
        bibleTextNode.innerHTML = ""; 



        if (passageObject.initialverse === undefined) { // example Job 2 
            let chapterLength = Object.keys(bible[passageObject.book][passageObject.chapter]).length
            for (let i = 1; i <= chapterLength; i++) {
                const pNode = document.createElement('p');
                pNode.id = 'verse'

                let xmlID = createXMLid(passageObject, i)
                pNode.classList.add(xmlID)


                pNode.innerHTML = `<sup class="verse-superscript">${i}</sup> ${bible[passageObject.book][passageObject.chapter][i]}`

                bibleTextNode.appendChild(pNode);
            }


        } else if (passageObject.endverse !== undefined) { // example: Job 2:3-4
            for (let i = Number(passageObject.initialverse); i <= Number(passageObject.endverse); i++) {    
                if (bible[passageObject.book][passageObject.chapter][i] !== undefined) {

                    const pNode = document.createElement('p')
                    pNode.id = 'verse'
                    let xmlID = createXMLid(passageObject, i)

                    pNode.classList.add(xmlID)

                    pNode.innerHTML = `<sup class="verse-superscript">${i}</sup>  ${bible[passageObject.book][passageObject.chapter][i]}`

                    bibleTextNode.appendChild(pNode);

                }
            }
        } else { // example: Job 2:2
            const pNode = document.createElement('p');
            pNode.id = 'verse'
            let xmlID = createXMLid(passageObject, passageObject.initialverse)
            pNode.classList.add(xmlID)


            pNode.innerHTML = `<sup class="verse-superscript">${passageObject.initialverse}</sup> ${bible[passageObject.book][passageObject.chapter][passageObject.initialverse]}` 
            bibleTextNode.appendChild(pNode);

        }
    }

    // Handles the DOM task of adding the correct header and verse to the .passage-container
    const getBiblePassage = (passageObject) => {
        console.log(passageObject)
        if (passageObject.book !== null) {
            createHeader(passageObject);
            createVerses(passageObject)   
        } 
    }


    const getCommentaryInput = () => {

        document.body.addEventListener('change', () => {
            let verses = document.querySelectorAll('p'); 

            verses.forEach((verse) => {
                verse.addEventListener('click', (event) => {
                    console.log(event.target.classList);
                    showCommentary(event.target.classList[0])
                })
            })
        })


    }

    const parseXML = (xmlText) =>  {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
        return xmlDoc
    }

    const fetchCommentary = async () => {
        const commentaryResponse = await fetch('https://ccel.org/ccel/s/schaff/npnf210.xml',  {mode: 'cors'});

        const commentaryData = await commentaryResponse.text();

        const xmlText = parseXML(commentaryData);

        return xmlText;
    }

    const showCommentary = async (osisReference) => {
        const res = await fetchCommentary()

        let refs = res.querySelectorAll(`[osisRef="${osisReference}"]`)
        console.log(refs)
        refs.forEach((ref) => {
            // let parent = ref.parentNode.parentNode.parentNode.parentNode.parentNode 
            console.log(ref.parentNode.parentNode.parentNode.textContent)
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


    return {getInput, getCommentaryInput}
}


export {
    SearchManager
}