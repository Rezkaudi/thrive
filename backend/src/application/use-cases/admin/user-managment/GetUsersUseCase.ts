import { UserRepository } from "../../../../infrastructure/database/repositories/UserRepository";
import { ProfileRepository } from "../../../../infrastructure/database/repositories/ProfileRepository";

export class GetUsersUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly profileRepository: ProfileRepository
    ) { }

    async execute(page: number = 1, limit: number = 20) {
        const users = await this.userRepository.findAll();
        const profiles = await this.profileRepository.findAll();

        const usersWithProfiles = users.map(user => {
            const profile = profiles.find(p => p.userId === user.id);
            return {
                ...user,
                profile
            };
        });

        return {
            users: usersWithProfiles,
            total: users.length,
            page: page,
            totalPages: Math.ceil(users.length / limit)
        };
    }
}