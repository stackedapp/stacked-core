import * as C from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { WithStore } from '../store';
import * as PreviewDocument from '../preview-document/preview-document';
import * as Types from '@meetalva/types';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import * as Model from '@meetalva/model';
import { Layout } from 'react-feather';

export interface PreviewPaneProps {
	isDragging: boolean;
}

const getSrcDoc = (_: unknown, project: Model.Project) => {
	return PreviewDocument.previewDocument({
		transferType: Types.PreviewTransferType.Inline,
		data: project.toJSON(),
		scripts: []
	});
};

@MobxReact.inject('store')
@MobxReact.observer
export class PreviewPaneWrapper extends React.Component<PreviewPaneProps> {
	private frame: HTMLIFrameElement | null = null;

	public componentDidMount() {
		const props = this.props as PreviewPaneProps & WithStore;
		const sender = props.store.getSender();

		if (this.frame && this.frame.contentWindow) {
			sender.setWindow(this.frame.contentWindow);
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as PreviewPaneProps & WithStore;
		const project = props.store.getProject();

		if (!project) {
			return null;
		}

		return (
			<C.PreviewPane>
				<OptimizedPreviewFrame
					frameRef={(frame: any) => (this.frame = frame)}
					project={project}
					offCanvas={false}
					onMouseLeave={() => {
						props.store.getProject().unsetHighlightedElement();
						props.store.getProject().unsetHighlightedElementContent();
					}}
				/>
				<C.Overlay isVisisble={props.isDragging}>
					<C.Space size={[0, 0, C.SpaceSize.L]}>
						<Layout size={C.IconSize.M} />
					</C.Space>
					<C.Copy size={C.CopySize.M}>Drop the component on the left element list</C.Copy>
				</C.Overlay>
			</C.PreviewPane>
		);
	}
}

interface OptimizedPreviewFrameProps extends C.PreviewFrameProps {
	frameRef: any;
	project: Model.Project;
}

@MobxReact.observer
class OptimizedPreviewFrame extends React.Component<OptimizedPreviewFrameProps> {
	@Mobx.observable private doc: string | undefined;

	// When mounted state changes
	// are performed via messages
	public componentWillUpdate() {
		return false;
	}

	public componentDidMount() {
		this.doc = getSrcDoc(this.props.project.getId(), this.props.project);
	}

	public render(): JSX.Element {
		return (
			<C.PreviewFrame
				ref={this.props.frameRef}
				srcDoc={this.doc}
				offCanvas={false}
				onMouseLeave={this.props.onMouseLeave}
			/>
		);
	}
}
