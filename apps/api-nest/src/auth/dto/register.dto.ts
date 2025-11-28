import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, {message: 'Invalid email format'})
    email!: string;

    @IsString()
    @MinLength(8, {message: 'Password must be at least 8 characters long'})
    @MaxLength(128, {message: 'Password must not exceed 128 characters'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    })
    password!: string;

    @IsString()
    @MinLength(2, {message: 'Display name must be at least 2 characters long'})
    @MaxLength(100, {message: 'Display name must not exceed 100 characters'})
    displayName!: string;
}
