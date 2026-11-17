export type GroupRole = 'admin' | 'member';

export interface GroupMember {
	id: string;
	name: string;
	email: string;
	role: GroupRole;
	/** ISO timestamp. */
	joinedAt: string;
}

/** A group (family, flat share) as seen by the signed-in user; `role` is their own. */
export interface Group {
	id: string;
	name: string;
	role: GroupRole;
	members: GroupMember[];
}

export interface GroupInvite {
	token: string;
	/** Link to `/{locale}/app/invite/{token}`, valid until `expiresAt`. */
	url: string;
	expiresAt: string;
}

export interface InvitePreview {
	groupId: string;
	groupName: string;
	invitedBy: string | null;
	alreadyMember: boolean;
}
