export default class ImageItem {
	constructor(baseName, newFile, oldFile, category) {
		this.baseName = baseName;
		this.newSrc = `images/${category}/new/${newFile}`;
		this.oldSrc = `images/${category}/old/${oldFile}`;
		this.category = category;
		this.title = baseName.replace(/[-_]/g, ' ');
	}
}
