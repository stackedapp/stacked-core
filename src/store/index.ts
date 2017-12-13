import { PatternFolder } from './pattern/folder';
import { JsonArray, JsonObject, Persister } from './json';
import * as MobX from 'mobx';
import { IObservableArray } from 'mobx/lib/types/observablearray';
import { Page } from './page';
import { PageElement } from './page/page_element';
import { PageRef } from './project/page_ref';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Project } from './project';

export class Store {
	@MobX.observable private currentPage?: Page;
	@MobX.observable private patternSearchTerm: string = '';
	@MobX.observable private projects: Project[] = [];
	@MobX.observable private patternRoot: PatternFolder;
	@MobX.observable private selectedElement?: PageElement | undefined;
	@MobX.observable private styleGuidePath: string;

	public addProject(project: Project): void {
		this.projects.push(project);
	}

	public getCurrentPage(): Page | undefined {
		return this.currentPage;
	}

	public getCurrentPageRef(): PageRef | undefined {
		if (!this.currentPage) {
			return undefined;
		}

		const currentPageId: string = this.currentPage.getId();
		for (const project of this.projects) {
			for (const pageRef of project.getPages()) {
				if (pageRef.getId() === currentPageId) {
					return pageRef;
				}
			}
		}

		return undefined;
	}

	public getCurrentProject(): Project | undefined {
		const pageRef: PageRef | undefined = this.getCurrentPageRef();
		return pageRef ? pageRef.getProject() : undefined;
	}

	public getPagesPath(): string {
		return PathUtils.join(this.styleGuidePath, 'alva');
	}

	public getPattern(path: string): Pattern | undefined {
		return this.patternRoot.getPattern(path);
	}

	public getPatternsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'lib', 'patterns');
	}

	public getPatternRoot(): PatternFolder | undefined {
		return this.patternRoot;
	}

	public getPatternSearchTerm(): string {
		return this.patternSearchTerm;
	}

	public getProjects(): Project[] {
		return this.projects;
	}

	public getSelectedElement(): PageElement | undefined {
		return this.selectedElement;
	}

	public getStyleGuidePath(): string {
		return this.styleGuidePath;
	}

	public openStyleguide(styleGuidePath: string): void {
		MobX.transaction(() => {
			if (!PathUtils.isAbsolute(styleGuidePath)) {
				// Currently, store is two levels below alva, so go two up
				styleGuidePath = PathUtils.join(__dirname, '..', '..', styleGuidePath);
			}
			this.styleGuidePath = styleGuidePath;
			this.currentPage = undefined;
			this.patternRoot = new PatternFolder(this, '');
			this.patternRoot.addTextPattern();

			(this.projects as IObservableArray<Project>).clear();
			const projectsPath = PathUtils.join(this.getPagesPath(), 'projects.json');
			const projectsJsonObject: JsonObject = Persister.loadYamlOrJson(projectsPath);
			(projectsJsonObject.projects as JsonArray).forEach((projectJson: JsonObject) => {
				const project: Project = Project.fromJsonObject(projectJson, this);
				this.addProject(project);
			});
		});
	}

	public openPage(id: string): void {
		MobX.transaction(() => {
			const pagePath: string = PathUtils.join(this.getPagesPath(), `page-${id}.json`);
			const json: JsonObject = Persister.loadYamlOrJson(pagePath);
			this.currentPage = Page.fromJsonObject(json, id, this);

			this.selectedElement = undefined;
		});
	}

	public removeProject(project: Project): void {
		(this.projects as IObservableArray<Project>).remove(project);
	}

	public savePage(): void {
		if (!this.currentPage) {
			throw new Error('Cannot save page: No page open');
		}

		this.currentPage.save();
	}

	public searchPatterns(term: string): Pattern[] {
		return this.patternRoot ? this.patternRoot.searchPatterns(term) : [];
	}

	public setPageFromJsonInternal(json: JsonObject, id: string): void {
		MobX.transaction(() => {
			this.currentPage = json ? Page.fromJsonObject(json, id, this) : undefined;
			this.selectedElement = undefined;
		});
	}

	public setPatternSearchTerm(patternSearchTerm: string): void {
		this.patternSearchTerm = patternSearchTerm;
	}

	public setSelectedElement(selectedElement: PageElement): void {
		this.selectedElement = selectedElement;
	}

	public unsetSelectedElement(): void {
		this.selectedElement = undefined;
	}
}
