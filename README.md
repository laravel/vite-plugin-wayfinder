# Wayfinder Vite Plugin

Vite plugin for [Wayfinder](https://github.com/laravel/wayfinder).

```ts
import { wayfinder } from "@laravel/vite-plugin-wayfinder";

export default defineConfig({
    plugins: [
        wayfinder(),
        // ...
    ],
});
```

All options have sensible defaults, but should you need to customize anything:

```ts
import { wayfinder } from "@laravel/vite-plugin-wayfinder";

export default defineConfig({
    plugins: [
        wayfinder({
            path: "my/custom/path/to/js",
            command: "herd php artisan generate:wayfinder",
            routes: false,
            actions: true,
            formVariants: false,
            patterns: ["resources/**/myroutes/*.php"],
        }),
        // ...
    ],
});
```

## Contributing

Thank you for considering contributing to the Wayfinder Vite Plugin! You can read the contribution guide [here](.github/CONTRIBUTING.md).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

Please review [our security policy](https://github.com/laravel/vite-plugin-wayfinder/security/policy) on how to report security vulnerabilities.

## License

The Wayfinder Vite Plugin is open-sourced software licensed under the [MIT license](LICENSE.md).
