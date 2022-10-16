#ifdef GL_ES
precision mediump float;
#endif


uniform vec2 u_resolution;
uniform float u_time;

vec3 cam_pos = vec3(0.0, 0.0, 0.0);
float cam_size = 1.0;

vec3 sun = normalize(vec3(1, 1, -1));



float sphere(vec3 center, float r, vec3 test_point){
	return max(distance(center, test_point) - r, 0.0);
}

float scene(vec3 test_point){
	test_point = mod(test_point, vec3(12.0));

	return sphere(vec3(6, 6, 6), 1.0 * 0.5 * (sin(u_time) + 2.0 ), test_point);
}

vec4 trace(vec3 start_point, vec3 direction, float e, int N){

	direction = normalize(direction);

	vec3 cur_point = start_point;
	float d = scene(cur_point);
	float acum = d;
	int iterations = 0;

	while(d > e && iterations < N){
		iterations++;
		cur_point = cur_point +  d * direction;
		d = scene(cur_point);
		acum += d;
	}

	if(iterations < N)
		return vec4(cur_point, acum);
	return vec4(vec3(0.0), -1.0);
}

vec3 normal(vec3 point){
	vec2 e = vec2(1e-3, 0.0);
	float d = scene(point);

	vec3 n = vec3(
		d - scene(point - e.xyy),
		d - scene(point - e.yxy),
		d - scene(point - e.yyx)
		);
	return n;
}

vec3 compute_color(vec2 uv){

	vec3 background_color_upper = vec3(0.529, 0.807, 0.980);
	vec3 background_color_lower = vec3(0.317, 0.482, 0.588);

 	vec4 hit = trace(cam_pos + 2.0 * vec3(u_time, 0.4 * u_time, 0.0),
		vec3(cam_size * 2.0 * (uv - vec2(0.5)), 1.0), 1e-1, 40);

	vec3 sky = mix(background_color_lower, background_color_upper, smoothstep(-0.1, 0.1, uv.y - 0.5));

	if(hit.w > 0.0){

		float luminace = dot(normalize(normal(hit.xyz)), sun);
		float fade = smoothstep(100.0, 240.0,hit.w);

		return mix(vec3(1.0) * luminace, sky, fade);
	}else{
		//sky
		return sky;
	}
}

void main(void){
	vec2 uv = gl_FragCoord.xy/u_resolution.xy;



	vec3 col = compute_color(uv);

	gl_FragColor = vec4(col, 1.0);
	//gl_FragColor = vec4(mix(background_color_upper, background_color_lower, sin(uv.y)), 1.0);
}
