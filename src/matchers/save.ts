import * as M from '../message';
import * as T from '../types';
import { Persistence } from '../persistence';
import * as Path from 'path';
import * as uuid from 'uuid';

export function save(
	{ host, dataHost }: T.MatcherContext,
	config: { passive: boolean }
): T.Matcher<M.Save> {
	return async m => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = m.appId || (app ? app.getId() : undefined);
		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		const name = project.getName() !== project.toJSON().id ? project.getName() : 'New Project';

		const targetPath =
			(!project.getDraft() ? project.getPath() : '') || m.payload.publish === false
				? ''
				: await host.selectSaveFile({
						title: 'Save Alva File',
						defaultPath: `${name}.alva`,
						filters: [
							{
								name: 'Alva File',
								extensions: ['alva']
							}
						]
				  });

		if (!targetPath) {
			return;
		}

		const serializeResult = await Persistence.serialize(project);

		if (serializeResult.state !== T.PersistenceState.Success) {
			sender.send({
				appId,
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${serializeResult.error.message}`,
					error: {
						message: serializeResult.error.message,
						stack: serializeResult.error.stack || ''
					}
				}
			});

			return;
		}

		project.setPath(targetPath);
		project.setDraft(project.getDraft() ? !m.payload.publish : false);

		if (!project.getDraft()) {
			project.setName(Path.basename(targetPath, Path.extname(targetPath)));
		}

		await dataHost.addProject(project);

		if (typeof window === 'undefined') {
			project.sync(await host.getSender());
		}

		try {
			await host.mkdir(Path.dirname(targetPath));
			await host.writeFile(targetPath, serializeResult.contents);

			if (m.payload.publish) {
				await host.saveFile(targetPath, serializeResult.contents);
			}

			if (config.passive) {
				return;
			}

			sender.send({
				appId,
				type: M.MessageType.SaveResult,
				transaction: m.transaction,
				id: uuid.v4(),
				payload: {
					previous: m.payload.projectId,
					project: project.toJSON()
				}
			});
		} catch (err) {
			sender.send({
				appId,
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${err.message}`,
					error: {
						message: err.message,
						stack: err.stack || ''
					}
				}
			});
		}
	};
}
