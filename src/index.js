import './style.css'
import { SearchManager } from './search'



function main() {
    const searchManager = SearchManager()  

    searchManager.getInput();
    searchManager.getCommentaryInput();


}

main()