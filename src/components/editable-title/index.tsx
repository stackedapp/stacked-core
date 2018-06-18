import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

import { Color } from '../colors';
import { CopySize } from '../copy';
import { getSpace, SpaceSize } from '../space';

export enum EditableTitleState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface EditableTitleProps {
	focused: boolean;
	name: string;
	nameState: EditableTitleState;
	secondary?: boolean;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface EditableInputProps {
	autoFocus: boolean;
	autoSelect: boolean;
	secondary?: boolean;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledEditableTitleProps {
	children: React.ReactNode;
	editable: boolean;
	focused?: boolean;
	secondary?: boolean;
}

interface StyledInputProps {
	secondary?: boolean;
}

const StyledTitle = styled.strong`
	box-sizing: border-box;
	display: inline-block;
	width: ${(props: StyledEditableTitleProps) => (props.secondary ? '130px' : '100%')};
	padding: 0;
	margin: ${(props: StyledEditableTitleProps) =>
		props.secondary ? `0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px` : 0};
	font-size: ${(props: StyledEditableTitleProps) =>
		props.secondary ? `${CopySize.M}px` : `${CopySize.S}px`};
	color: ${(props: StyledEditableTitleProps) => (props.secondary ? Color.Grey36 : Color.Black)};
	font-weight: normal;
	text-align: center;
	cursor: ${(props: StyledEditableTitleProps) => (props.editable ? 'text' : 'default')};
	overflow: ${(props: StyledEditableTitleProps) => (props.secondary ? 'none' : 'hidden')};
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const StyledEditableTitle = styled.input`
	box-sizing: border-box;
	display: inline-block;
	width: ${(props: StyledInputProps) => (props.secondary ? '130px' : '100%')};
	border: 0;
	padding: 0;
	margin: ${(props: StyledInputProps) =>
		props.secondary ? `0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px` : '3px 0px'};
	font-size: ${(props: StyledInputProps) =>
		props.secondary ? `${CopySize.M}px` : `${CopySize.S}px`};
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	outline-offset: 0;

	:focus {
		outline: none;
	}
`;

class EditableInput extends React.Component<EditableInputProps> {
	public componentDidMount(): void {
		const node = ReactDOM.findDOMNode(this);
		if (!node) {
			return;
		}
		const element = node as HTMLInputElement;

		if (this.props.autoSelect) {
			element.setSelectionRange(0, this.props.value.length);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<StyledEditableTitle
				autoFocus
				data-title={true}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				secondary={props.secondary}
				value={props.value}
			/>
		);
	}
}

export const EditableTitle: React.SFC<EditableTitleProps> = (props): JSX.Element => (
	<div onClick={props.onClick}>
		{props.nameState === EditableTitleState.Editing ? (
			<EditableInput
				autoFocus
				autoSelect
				data-title={true}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				secondary={props.secondary}
				value={props.name}
			/>
		) : (
			<StyledTitle data-title={true} editable={props.focused} secondary={props.secondary}>
				{props.name}
			</StyledTitle>
		)}
	</div>
);
