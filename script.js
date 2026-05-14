const $ = id => document.getElementById(id);
        const musica = $('musica');
        const TIMING = { transition: 800, p2_delay: 15000, p2_scroll: 45000, p3_scroll: 55000, final_scroll: 112000, final_exit_delay: 90000 };

        function createParticles() {

            const containers = ['particle-container', 'welcome-particles', 'prep-particles'];
            const colors = ['#ffffff', '#ffebef', '#e3f2fd', '#fff5f8'];

            containers.forEach(id => {
                const container = $(id);
                if (!container) return;

                for (let i = 0; i < 100; i++) {
                    const p = document.createElement('div');
                    p.className = 'particle';
                 
                    const size = Math.random() * 4 + 1 + 'px';
                    p.style.width = p.style.height = size;
                    p.style.left = Math.random() * 100 + '%';
                    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    p.style.animationDuration = Math.random() * 5 + 5 + 's';
                    p.style.animationDelay = Math.random() * 10 + 's';
                    container.appendChild(p);
                }
            });
        }

      
        function changeScreen(hideId, showId) {
            const hide = $(hideId), show = $(showId);
            const musicaPrevia = $('musica-previa');
            const musicaPrincipal = $('musica');

            // 1. Activar música previa al primer clic (desde Screen Welcome)
            if (hideId === "screen-welcome") {
                musicaPrevia.play().catch(e => console.log("Audio bloqueado aún"));
            }

            // 2. Detener música previa suavemente al salir de indicaciones
            if (hideId === "screen-prep" && showId === "screen-start") {
                fadeOutAudio(musicaPrevia, 2500); // 2.5 segundos de desvanecimiento
            }

            // 3. Iniciar música principal en la Pantalla 1
            // ... dentro de changeScreen ...
            if (hideId === "screen-start") {
                // SEGURO PARA iOS: Pausamos manualmente la previa por si el fade falló
                $('musica-previa').pause();

                musicaPrincipal.play().catch(() => { });
                $('main-bg-video').play();
            }

            // Animación de transición de pantallas (lo que ya tenías)
            hide.style.opacity = 0;
            setTimeout(() => {
                hide.style.display = 'none';
                show.style.display = 'flex';
                void show.offsetWidth;
                show.style.opacity = 1;
                if (showId === "screen-main") screenMainLogic.init();
                if (showId === "screen-final") screenFinalLogic.init();
            }, 800); // Usando el tiempo de transición estándar
        }

        const screenMainLogic = {
            init() {
                setTimeout(() => $('main-bg-video').style.opacity = 1, 100);
                document.querySelectorAll('.foto-marco').forEach((f, i) => setTimeout(() => f.style.opacity = 1, 300 + (i * 2000)));
                setTimeout(() => {
                    const cont = $('container-1'), text = $('text-1');
                    cont.style.opacity = 1;
                    text.style.animation = `scrollUpShort ${TIMING.p2_scroll / 1000 + 5}s linear forwards`;
                    setTimeout(() => this.showFixed(), TIMING.p2_scroll);
                }, TIMING.p2_delay);
            },

            showFixed() {
                const cont = $('container-1'), fixed = $('fixed-message'), btn = $('btn-next');
                cont.style.opacity = 0;
                setTimeout(() => {
                    cont.style.display = 'none';
                    fixed.style.display = 'block';
                    setTimeout(() => fixed.style.opacity = 1, 50);
                    setTimeout(() => {
                        fixed.style.opacity = 0;
                        setTimeout(() => {
                            fixed.style.display = 'none';
                            btn.style.display = 'block';
                            void btn.offsetWidth; btn.style.opacity = 1;
                        }, 800);
                    }, 5000);
                }, 500);
            }
        };

        const screenFinalLogic = {
            init() {
                setTimeout(() => {
                    const cont = $('container-2'), text = $('text-2');
                    cont.style.opacity = 1;
                    text.style.animation = `scrollUpShort ${TIMING.p3_scroll / 1000 + 5}s linear forwards`;
                    setTimeout(() => {
                        cont.style.opacity = 0;
                        setTimeout(() => {
                            cont.style.display = 'none';
                            const btn = $('btn-play');
                            btn.style.display = 'block';
                            void btn.offsetWidth; btn.style.opacity = 1;
                        }, 1000);
                    }, TIMING.p3_scroll);
                }, 500);
            }
        };

        function playRegalo() {
            const videoCont = $('video-final-container'), video = $('video-regalo');
            $('btn-play').style.display = "none";
            videoCont.style.display = "block";
            video.play();
            video.onended = () => {
                videoCont.style.opacity = 0;
                setTimeout(() => { videoCont.style.display = "none"; startDespedida(); }, 1000);
            };
        }

        function startDespedida() {
            const contD = $('container-despedida'), textD = $('text-despedida');
            contD.style.display = "block";

            setTimeout(() => {
                contD.style.opacity = 1;
                // La animación usa final_scroll para la VELOCIDAD
                textD.style.animation = `scrollUpLong ${TIMING.final_scroll / 1000}s linear forwards`;

                // El cierre usa final_exit_delay para no dejar la pantalla vacía
                setTimeout(() => {
                    contD.style.opacity = 0;
                    setTimeout(() => {
                        contD.style.display = "none";
                        const final = $('final-layout');
                        final.style.backgroundImage = "url('Pictures/foto_final_dayana.jpeg')";
                        final.style.display = "flex";
                        void final.offsetWidth;
                        final.style.opacity = 1;
                    }, 1500);
                }, TIMING.final_exit_delay); // <--- Aquí usamos el nuevo tiempo de salida

            }, 2000);
        }
        function fadeOutAudio(audio, duration) {
            // Intentamos el fade normal
            const startVolume = audio.volume;
            const step = startVolume / (duration / 100);

            const fadeInterval = setInterval(() => {
                // Verificamos si el navegador permite cambiar el volumen
                const prevVolume = audio.volume;
                audio.volume = Math.max(0, audio.volume - step);

                // Si el volumen no cambió (bloqueo de iOS) o llegó a 0
                if (audio.volume === prevVolume || audio.volume <= 0) {
                    clearInterval(fadeInterval);
                    audio.pause();
                    audio.currentTime = 0; // Reinicia la canción
                    audio.volume = 1;      // Reset para futuros usos
                }
            }, 100);
        }

        function fadeInAudio(audio, duration) {
            audio.volume = 0;
            const step = 1 / (duration / 100);
            const interval = setInterval(() => {
                if (audio.volume < 1 - step) {
                    audio.volume += step;
                } else {
                    audio.volume = 1;
                    clearInterval(interval);
                }
            }, 100);
        }
        function redigirACancion() {
            // 1. Bajamos el volumen de la música actual suavemente
            const musicaPrincipal = $('musica');
            fadeOutAudio(musicaPrincipal, 1500);

            // 2. Fundido a negro de la pantalla para una transición limpia
            document.body.style.transition = "opacity 1.5s ease";
            document.body.style.opacity = 0;

            // 3. Redirección después de 1.5 segundos
            setTimeout(() => {
                window.location.href = "https://www.youtube.com/watch?v=-MsWR_FGa6U&list=RD-MsWR_FGa6U&start_radio=1";
            }, 1500);
        }

        window.onload = createParticles;