import type { Group, GroupInvite, InvitePreview } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { GroupsApi } from './types.ts';

/** REST implementation – talks to the Spring Boot backend. */
export const groupsApi: GroupsApi = {
	list: () => http.get<Group[]>(endpoints.groups.collection),
	create: (name) => http.post<Group>(endpoints.groups.collection, { name }),
	rename: (id, name) => http.patch<Group>(endpoints.groups.item(id), { name }),
	remove: (id) => http.delete<void>(endpoints.groups.item(id)),
	removeMember: (id, userId) => http.delete<void>(endpoints.groups.member(id, userId)),
	invite: (id, email) => http.post<GroupInvite>(endpoints.groups.invites(id), { email }),
	preview: (token) => http.get<InvitePreview>(endpoints.invites.item(token)),
	accept: (token) => http.post<Group>(endpoints.invites.accept(token))
};
