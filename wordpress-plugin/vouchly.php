<?php
/**
 * Plugin Name: Vouchly Testimonials
 * Plugin URI:  https://vouchly.tech
 * Description: Embed your Vouchly testimonial wall anywhere on your site using a simple shortcode.
 * Version:     1.0.0
 * Author:      Vouchly
 * Author URI:  https://vouchly.tech
 * License:     GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'VOUCHLY_VERSION',  '1.0.0' );
define( 'VOUCHLY_BASE_URL', 'https://vouchly.tech' );

/* ------------------------------------------------------------------ */
/*  Activation: show a one-time "go configure the plugin" notice       */
/* ------------------------------------------------------------------ */
register_activation_hook( __FILE__, function () {
    set_transient( 'vouchly_activated', true, 30 );
} );

add_action( 'admin_notices', function () {
    if ( ! get_transient( 'vouchly_activated' ) ) return;
    delete_transient( 'vouchly_activated' );
    $url = admin_url( 'options-general.php?page=vouchly' );
    echo '<div class="notice notice-success is-dismissible">'
       . '<p><strong>Vouchly Testimonials</strong> is active! '
       . '<a href="' . esc_url( $url ) . '">Enter your space slug</a> to finish setup.</p>'
       . '</div>';
} );

/* ------------------------------------------------------------------ */
/*  Admin settings page                                                 */
/* ------------------------------------------------------------------ */
add_action( 'admin_menu', function () {
    add_options_page(
        'Vouchly Testimonials',
        'Vouchly',
        'manage_options',
        'vouchly',
        'vouchly_settings_page'
    );
} );

add_action( 'admin_init', function () {
    register_setting( 'vouchly_settings', 'vouchly_default_space', [
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ] );
} );

function vouchly_settings_page() {
    $slug     = get_option( 'vouchly_default_space', '' );
    $wall_url = $slug ? VOUCHLY_BASE_URL . '/wall/' . esc_attr( $slug ) : '';
    ?>
    <div class="wrap">
        <h1>
            <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#d4751f;border-radius:7px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                </span>
                Vouchly Testimonials
            </span>
        </h1>

        <p style="color:#555;max-width:560px;margin-top:.5rem;">
            Add your testimonial wall anywhere on your site using the shortcode
            <code>[vouchly]</code>. You can also specify a space per-shortcode:
            <code>[vouchly space="your-slug"]</code>.
        </p>

        <form method="post" action="options.php">
            <?php settings_fields( 'vouchly_settings' ); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="vouchly_default_space">Default Space Slug</label>
                    </th>
                    <td>
                        <input
                            type="text"
                            id="vouchly_default_space"
                            name="vouchly_default_space"
                            value="<?php echo esc_attr( $slug ); ?>"
                            class="regular-text"
                            placeholder="e.g. my-product"
                        />
                        <p class="description">
                            Find your space slug in your
                            <a href="<?php echo esc_url( VOUCHLY_BASE_URL . '/dashboard/spaces' ); ?>" target="_blank">
                                Vouchly dashboard
                            </a>.
                            This is used when the shortcode has no <code>space=""</code> attribute.
                        </p>
                    </td>
                </tr>
            </table>

            <?php submit_button( 'Save Settings' ); ?>
        </form>

        <?php if ( $slug ) : ?>
        <hr style="margin:2rem 0;">
        <h2 style="font-size:1rem;">Shortcode Examples</h2>
        <table class="form-table" role="presentation">
            <tr>
                <th>Basic (uses default slug)</th>
                <td><code>[vouchly]</code></td>
            </tr>
            <tr>
                <th>Specific space</th>
                <td><code>[vouchly space="<?php echo esc_attr( $slug ); ?>"]</code></td>
            </tr>
            <tr>
                <th>Limit to 3 testimonials</th>
                <td><code>[vouchly space="<?php echo esc_attr( $slug ); ?>" limit="3"]</code></td>
            </tr>
        </table>

        <hr style="margin:2rem 0;">
        <h2 style="font-size:1rem;">Preview your wall</h2>
        <p>
            <a href="<?php echo esc_url( $wall_url ); ?>" target="_blank" class="button">
                View testimonial wall &rarr;
            </a>
        </p>
        <?php endif; ?>
    </div>
    <?php
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [vouchly space="slug" limit="6"]                        */
/* ------------------------------------------------------------------ */
add_shortcode( 'vouchly', function ( $atts ) {
    $atts = shortcode_atts(
        [
            'space' => get_option( 'vouchly_default_space', '' ),
            'limit' => '6',
        ],
        $atts,
        'vouchly'
    );

    $slug  = sanitize_text_field( $atts['space'] );
    $limit = absint( $atts['limit'] );

    if ( empty( $slug ) ) {
        if ( current_user_can( 'manage_options' ) ) {
            return '<p style="color:#c0392b;font-size:13px;">'
                 . '[Vouchly] No space slug set. '
                 . '<a href="' . esc_url( admin_url( 'options-general.php?page=vouchly' ) ) . '">Configure it here</a>.'
                 . '</p>';
        }
        return '';
    }

    $src = esc_url( VOUCHLY_BASE_URL . '/embed.js' );

    // Output the script tag inline so document.currentScript carries data-space.
    // wp_enqueue_script strips custom data-* attributes, so direct output is intentional.
    ob_start();
    ?>
    <div id="vouchly-widget-<?php echo esc_attr( $slug ); ?>"></div>
    <script
        src="<?php echo $src; ?>"
        data-space="<?php echo esc_attr( $slug ); ?>"
        data-limit="<?php echo esc_attr( $limit ); ?>"
        async
    ></script>
    <?php
    return ob_get_clean();
} );
