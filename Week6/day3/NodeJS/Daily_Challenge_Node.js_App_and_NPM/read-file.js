import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readFileData() {
    const filePath = join(__dirname, 'files', 'file-data.txt');
    const content = readFileSync(filePath, 'utf8');
    console.log(content);
}

export default readFileData;
